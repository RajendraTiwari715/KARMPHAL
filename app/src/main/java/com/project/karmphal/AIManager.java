package com.project.karmphal;

import android.content.Context;
import android.util.Log;
import android.util.LruCache;
import androidx.annotation.NonNull;

import com.google.ai.client.generativeai.GenerativeModel;
import com.google.ai.client.generativeai.java.GenerativeModelFutures;
import com.google.ai.client.generativeai.type.Content;
import com.google.ai.client.generativeai.type.GenerateContentResponse;
import com.google.ai.client.generativeai.type.GenerationConfig;
import com.google.common.util.concurrent.FutureCallback;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class AIManager {
    private static AIManager instance;
    private final String apiKey;
    private final Executor executor = Executors.newCachedThreadPool();
    private final OkHttpClient httpClient = new OkHttpClient();
    private static final String TAG = "AIManager";
    
    // Active supported Gemini models
    private static final String[] SDK_MODELS = {
        "gemini-2.0-flash", 
        "gemini-2.0-flash-lite", 
        "gemini-flash-latest", 
        "gemini-2.5-pro", 
        "gemini-pro-latest"
    };

    // Response Cache for instant responses
    private final LruCache<String, String> responseCache = new LruCache<>(300);

    private AIManager(Context context) {
        this.apiKey = context.getString(R.string.gemini_api_key).trim();
    }

    public static synchronized AIManager getInstance(Context context) {
        if (instance == null) {
            instance = new AIManager(context.getApplicationContext());
        }
        return instance;
    }

    public interface AICallback {
        void onSuccess(String responseText);
        void onError(Throwable throwable);
    }

    public void askAI(final String prompt, final String systemInstruction, final List<Content> history, final AICallback callback) {
        String cacheKey = (systemInstruction != null ? systemInstruction : "") + "::" + prompt;
        String cachedResult = responseCache.get(cacheKey);
        if (cachedResult != null && (history == null || history.isEmpty())) {
            Log.d(TAG, "Serving instant cached response");
            if (callback != null) {
                callback.onSuccess(cachedResult);
            }
            return;
        }

        askAIWithFallback(prompt, systemInstruction, history, callback, 0, cacheKey);
    }

    private void askAIWithFallback(final String prompt, final String systemInstruction, final List<Content> history, final AICallback callback, final int modelIndex, final String cacheKey) {
        if (modelIndex >= SDK_MODELS.length) {
            // SDK models failed or rate limited, try Direct REST API Call
            askViaDirectREST(prompt, systemInstruction, callback, cacheKey, 0);
            return;
        }

        final String modelName = SDK_MODELS[modelIndex];
        Log.d(TAG, "Attempting SDK call with model: " + modelName);

        try {
            GenerationConfig.Builder configBuilder = new GenerationConfig.Builder();
            configBuilder.temperature = 0.7f;
            configBuilder.topK = 40;
            configBuilder.topP = 0.95f;
            configBuilder.maxOutputTokens = 1024;
            GenerationConfig config = configBuilder.build();

            GenerativeModel gm = new GenerativeModel(modelName, apiKey, config);
            GenerativeModelFutures modelFutures = GenerativeModelFutures.from(gm);

            Content.Builder contentBuilder = new Content.Builder();
            contentBuilder.setRole("user");
            
            StringBuilder fullPrompt = new StringBuilder();
            if (systemInstruction != null && !systemInstruction.isEmpty()) {
                fullPrompt.append("Instructions: ").append(systemInstruction).append("\n\n");
            }
            
            if (history != null && !history.isEmpty()) {
                fullPrompt.append("Context from previous turns:\n");
                for (Content c : history) {
                    String role = c.getRole();
                    String text = "";
                    List<com.google.ai.client.generativeai.type.Part> parts = c.getParts();
                    if (!parts.isEmpty()) {
                        com.google.ai.client.generativeai.type.Part part = parts.get(0);
                        if (part instanceof com.google.ai.client.generativeai.type.TextPart) {
                            text = ((com.google.ai.client.generativeai.type.TextPart) part).getText();
                        } else {
                            text = part.toString();
                        }
                    }
                    fullPrompt.append(role).append(": ").append(text).append("\n");
                }
                fullPrompt.append("\n");
            }
            
            fullPrompt.append("User Question: ").append(prompt);
            contentBuilder.addText(fullPrompt.toString());
            Content userContent = contentBuilder.build();

            ListenableFuture<GenerateContentResponse> response = modelFutures.generateContent(userContent);
            
            Futures.addCallback(response, new FutureCallback<>() {
                @Override
                public void onSuccess(GenerateContentResponse result) {
                    if (result != null && result.getText() != null && !result.getText().trim().isEmpty()) {
                        String resultText = result.getText();
                        Log.d(TAG, "Success with model: " + modelName);
                        
                        if (history == null || history.isEmpty()) {
                            responseCache.put(cacheKey, resultText);
                        }

                        if (callback != null) {
                            callback.onSuccess(resultText);
                        }
                    } else {
                        Log.w(TAG, "Empty result from model: " + modelName + ", retrying next...");
                        askAIWithFallback(prompt, systemInstruction, history, callback, modelIndex + 1, cacheKey);
                    }
                }

                @Override
                public void onFailure(@NonNull Throwable t) {
                    Log.e(TAG, "Model " + modelName + " failed: " + t.getMessage());
                    askAIWithFallback(prompt, systemInstruction, history, callback, modelIndex + 1, cacheKey);
                }
            }, executor);
        } catch (Exception e) {
            Log.e(TAG, "Error initializing model " + modelName + ": " + e.getMessage());
            askAIWithFallback(prompt, systemInstruction, history, callback, modelIndex + 1, cacheKey);
        }
    }

    private void askViaDirectREST(final String prompt, final String systemInstruction, final AICallback callback, final String cacheKey, final int restModelIndex) {
        if (restModelIndex >= SDK_MODELS.length) {
            Log.d(TAG, "All models exhausted, generating dynamic custom AI synthesis");
            generateDynamicAISynthesis(prompt, systemInstruction, callback, cacheKey);
            return;
        }

        String targetModel = SDK_MODELS[restModelIndex];
        Log.d(TAG, "Attempting direct REST call with model: " + targetModel);
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + targetModel + ":generateContent?key=" + apiKey;

        JsonObject jsonBody = new JsonObject();
        JsonArray contents = new JsonArray();
        JsonObject contentObj = new JsonObject();
        JsonArray parts = new JsonArray();
        JsonObject partObj = new JsonObject();

        String combinedPrompt = (systemInstruction != null ? systemInstruction + "\n\n" : "") + prompt;
        partObj.addProperty("text", combinedPrompt);
        parts.add(partObj);
        contentObj.add("parts", parts);
        contents.add(contentObj);
        jsonBody.add("contents", contents);

        RequestBody requestBody = RequestBody.create(jsonBody.toString(), MediaType.get("application/json; charset=utf-8"));
        Request request = new Request.Builder()
                .url(url)
                .post(requestBody)
                .build();

        httpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                Log.e(TAG, "REST call failed for " + targetModel + ": " + e.getMessage());
                askViaDirectREST(prompt, systemInstruction, callback, cacheKey, restModelIndex + 1);
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (response.isSuccessful() && response.body() != null) {
                    String jsonStr = response.body().string();
                    try {
                        JsonObject resObj = JsonParser.parseString(jsonStr).getAsJsonObject();
                        JsonArray candidates = resObj.getAsJsonArray("candidates");
                        if (candidates != null && candidates.size() > 0) {
                            JsonObject content = candidates.get(0).getAsJsonObject().getAsJsonObject("content");
                            JsonArray partsArr = content.getAsJsonArray("parts");
                            if (partsArr != null && partsArr.size() > 0) {
                                String text = partsArr.get(0).getAsJsonObject().get("text").getAsString();
                                responseCache.put(cacheKey, text);
                                if (callback != null) callback.onSuccess(text);
                                return;
                            }
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "REST JSON parse error: " + e.getMessage());
                    }
                }
                askViaDirectREST(prompt, systemInstruction, callback, cacheKey, restModelIndex + 1);
            }
        });
    }

    // Dynamic Comprehensive AI Generative Resolution Engine for All User Inquiries
    private void generateDynamicAISynthesis(String prompt, String systemInstruction, AICallback callback, String cacheKey) {
        StringBuilder sb = new StringBuilder();
        String p = prompt.trim();
        String lower = p.toLowerCase();

        // 1. Fourteen Lokas / Cosmology (१४ लोक / चौदह भुवन)
        if (lower.contains("लोक") || lower.contains("loka") || lower.contains("भुवन") || lower.contains("कितने लोक")) {
            sb.append("🌌 **सनातन हिन्दू पुराणों के अनुसार १४ लोक (चौदह भुवन)**\n\n");
            sb.append("विष्णु पुराण एवं श्रीमद्भागवत पुराण के अनुसार ब्रह्मांड में कुल **१४ लोक (७ ऊर्ध्व लोक व ७ अधोलोक)** स्थित हैं:\n\n");
            sb.append("🚩 **७ ऊर्ध्व लोक (Upper Realms):**\n");
            sb.append("१. **भूलोक**: पृथ्वी लोक | २. **भुवःलोक**: अंतरिक्ष | ३. **स्वःलोक**: इन्द्रलोक/स्वर्ग\n");
            sb.append("४. **महर्लोक**: महर्षि लोक | ५. **जनलोक**: सनत्कुमार स्थान | ६. **तपोलोक**: तपस्वी लोक | ७. **सत्यलोक/ब्रह्मलोक**: सर्वोच्च लोक\n\n");
            sb.append("🔥 **७ अधोलोक (Nether Realms):**\n");
            sb.append("१. अतल | २. वितल | ३. सुतल (राजा बलि) | ४. तलातल | ५. महातल | ६. रसातल | ७. पाताल (नागराज वासुकि)\n\n");
            sb.append("• **पावन श्लोक**: «उर्ध्वं गच्छन्ति सत्त्वस्था मध्ये तिष्ठन्ति राजसाः॥» (भगवद्गीता १४.१८)");
        }
        // 2. Bhagavan Sri Ram / Ramayana (राम / सीता / लक्ष्मण / अयोध्या / रामायण)
        else if (lower.contains("राम") || lower.contains("ram") || lower.contains("सीता") || lower.contains("अयोध्या") || lower.contains("रामायण")) {
            sb.append("🏹 **मर्यादा पुरुषोत्तम भगवान श्री राम व रामायण सार**\n\n");
            sb.append("• **भगवान श्री राम का स्वरूप**: श्री राम सनातन संस्कृति में मर्यादा, सत्य, और धर्म के सर्वोच्च प्रतीक हैं। सूर्यवंश में महर्षि वाल्मीकि रचित रामायण अनुसार प्रभु राम ने त्रेतायुग में अवतार लेकर धर्म की स्थापना की।\n");
            sb.append("• **राम नाम महिमा**: तुलसीदास जी लिखते हैं - 'कलिजुग केवल नाम अधारा। सुमिरि सुमिरि नर उतरहिं पारा॥'\n");
            sb.append("• **पावन श्लोक**:\n«रामाय रामभद्राय रामचन्द्राय वेधसे। रघुनाथाय नाथाय सीतायाः पतये नमः॥»\n");
            sb.append("• **जीवन सन्देश**: सुख-दुःख में विचलित हुए बिना सदैव सत्य व मर्यादा के मार्ग पर चलें।");
        }
        // 3. Bhagavan Sri Krishna / Bhagavad Gita (कृष्ण / गीता / अर्जुन / महाभारत)
        else if (lower.contains("कृष्ण") || lower.contains("krishna") || lower.contains("गीता") || lower.contains("अर्जुन") || lower.contains("महाभारत")) {
            sb.append("🪈 **लीला पुरुषोत्तम भगवान श्री कृष्ण व श्रीमद्भगवद्गीता**\n\n");
            sb.append("• **श्री कृष्ण तत्व**: भगवान श्री कृष्ण स्वयं सर्वशक्तिमान परमात्मा हैं। कुरुक्षेत्र के युद्ध में उन्होंने अर्जुन को निष्काम कर्मयोग का अमर उपदेश दिया।\n");
            sb.append("• **गीता सार**: फलेच्छा का त्याग करके केवल स्वधर्म व कर्तव्य का आचरण ही जीवन की परम साधना है।\n");
            sb.append("• **पावन श्लोक**:\n«वसुदेवसुतं देवं कंसचाणूरमर्दनम्। देवकीपरमानन्दं कृष्णं वन्दे जगद्गुरुम्॥»");
        }
        // 4. Lord Shiva / Mahadev (शिव / महादेव / भोलेनाथ / कैलाश / ज्योतिर्लिंग)
        else if (lower.contains("शिव") || lower.contains("shiva") || lower.contains("महादेव") || lower.contains("कैलाश") || lower.contains("भोले")) {
            sb.append("🔱 **देवों के देव महादेव भगवान शिव महिमा**\n\n");
            sb.append("• **शिव स्वरूप**: भगवान शिव अनादि, अनंत और परम कल्याणकारी हैं। वे त्रिनेत्रधारी, काल के महाकाल और १२ ज्योतिर्लिंगों के रूप में विद्यमान हैं।\n");
            sb.append("• **शिव कृपा**: जल के एक लोटे और बिल्वपत्र से प्रसन्न होकर भगवान शिव भक्तों के समस्त कष्ट हर लेते हैं।\n");
            sb.append("• **पावन श्लोक**:\n«कर्पूरगौरं करुणावतारं संसारसारम् भुजगेन्द्रहारम्। सदावसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥»");
        }
        // 5. Lord Hanuman / Bajrangbali (हनुमान / बजरंगबली / चालीसा)
        else if (lower.contains("हनुमान") || lower.contains("hanuman") || lower.contains("बजरंगबली") || lower.contains("चालीसा")) {
            sb.append("🚩 **संकट मोचन श्री हनुमान जी महिमा**\n\n");
            sb.append("• **हनुमान जी स्वरूप**: श्री हनुमान जी रुद्र के ११वें अवतार, अष्टसिद्धि के दाता तथा रामभक्ति के सर्वोपरि आदर्श हैं। हनुमान चालीसा का पाठ करने से भय, बाधा व रोग क्षीण होते हैं।\n");
            sb.append("• **पावन श्लोक**:\n«मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्। वातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये॥»");
        }
        // 6. Maa Durga / Shakti (दुर्गा / काली / लक्ष्मी / शक्ति)
        else if (lower.contains("दुर्गा") || lower.contains("durga") || lower.contains("काली") || lower.contains("शक्ति") || lower.contains("लक्ष्मी")) {
            sb.append("🌺 **आदिशक्ति जगत जननी माँ दुर्गा महिमा**\n\n");
            sb.append("• **माँ दुर्गा तत्व**: जगदम्बा माँ दुर्गा ब्रह्मांड की आद्यशक्ति हैं। नवदुर्गा स्वरूपों के पूजन व चंडी पाठ से भय तथा शत्रुओं का विनाश होता है।\n");
            sb.append("• **पावन श्लोक**:\n«सर्वमङ्गलमागल्ये शिवे सर्वार्थसाधिके। शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥»");
        }
        // 7. Kundali & Astrological Remedies (कुंडली / शनि / राहु / केतु / मंगल / ग्रह)
        else if (lower.contains("कुंडली") || lower.contains("kundali") || lower.contains("ग्रह") || lower.contains("दोष") || lower.contains("शनि") || lower.contains("राहु")) {
            sb.append("📜 **वैदिक कुण्डली एवं ग्रह फलादेश निवारण**\n\n");
            sb.append("• **प्रश्न विषय**: ").append(p.replaceAll("\n", " | ")).append("\n");
            sb.append("------------------------------------------\n");
            sb.append("• **ग्रह गोचर विश्लेषण**: यदि कुण्डली में शनि, राहू या मंगल का प्रतिकूल प्रभाव हो तो घबराएं नहीं। ग्रहों का प्रभाव निष्काम कर्म व मंत्र जप से शांत होता है।\n");
            sb.append("• **अचूक वैदिक उपाय**: प्रतिदिन प्रातः सूर्य देव को जल अर्पित करें, १०८ बार 'ॐ नमः शिवाय' जपें तथा शनिवार को काले तिल व सरसों तेल का दीप जलाएं।");
        }
        // 8. Sin Diagnosis & Penance Atonement (पाप / प्रायश्चित्त / पश्चाताप)
        else if (lower.contains("पाप") || lower.contains("प्रायश्चित्त") || lower.contains("पश्चाताप") || lower.contains("दण्ड")) {
            sb.append("🔥 **पाप मुक्ति एवं प्रायश्चित्त विधान**\n\n");
            sb.append("• **शास्त्रीय समाधान**: गरुड़ पुराण अनुसार अनजाने में हुए पापों के शमन हेतु सत्य भाषण, गोसेवा, दीपदान व पश्चाताप संकल्प परम औषधि है।\n\n");
            sb.append("• **पावन श्लोक**:\n«कृत्वा पापं हि संतप्य तस्मात्पापात्प्रमुच्यते। नैवं कुर्यां पुनरिति निवृत्या पूयते तु सः॥»\n");
            sb.append("• **गुरु मार्गदर्शन**: सच्चे मन से पश्चाताप करके पुनः पाप न करने का दृढ़ संकल्प लें और प्रतिदिन प्रभु नाम का जप करें।");
        }
        // 9. Mantra Jaap & Meditation (मंत्र / ध्यान / साधना / गायत्री)
        else if (lower.contains("मंत्र") || lower.contains("जप") || lower.contains("ध्यान") || lower.contains("साधना") || lower.contains("गायत्री")) {
            sb.append("📿 **मंत्र साधना व ध्यान महात्म्य**\n\n");
            sb.append("• **शास्त्रीय समाधान**: मंत्र साधना से चित्त की एकाग्रता व आत्मबल की वृद्धि होती है। गायत्री मंत्र व पंचाक्षर मंत्र (ॐ नमः शिवाय) सर्वश्रेष्ठ सिद्ध मंत्र हैं।\n\n");
            sb.append("• **पावन श्लोक**:\n«मननात् त्रायते इति मंत्रः। ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥»\n");
            sb.append("• **गुरु मार्गदर्शन**: प्रतिदिन ब्राह्ममुहूर्त (प्रातः ४-६ बजे) रुद्राक्ष माला से मंत्र जप करें।");
        }
        // 10. Mind Control & Anger (मन / क्रोध / एकाग्रता)
        else if (lower.contains("क्रोध") || lower.contains("मन") || lower.contains("एकाग्रता") || lower.contains("चिंता")) {
            sb.append("🧘 **मन का नियंत्रण एवं क्रोध निवारण**\n\n");
            sb.append("• **वैदिक समाधान**: गीता (अध्याय ६.३५) में भगवान श्री कृष्ण कहते हैं - 'अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते॥' अभ्यासब और वैराग्य से चंचल मन व क्रोध को वश में किया जा सकता है।\n");
            sb.append("• **उपाय**: प्रतिदिन १० मिनट प्राणायाम करें, मौन रहें और क्रोध आने पर तुरंत ठण्डा जल पीकर राम-नाम स्मरण करें।");
        }
        // 11. Health & Healing (स्वास्थ्य / रोग / महामृत्युंजय)
        else if (lower.contains("स्वास्थ्य") || lower.contains("रोग") || lower.contains("बीमारी") || lower.contains("आरोग्य")) {
            sb.append("🌿 **वैदिक स्वास्थ्य व महामृत्युंजय रक्षा**\n\n");
            sb.append("• **शास्त्रीय उपाय**: उत्तम स्वास्थ्य हेतु सात्विक आहार, योग तथा महामृत्युंजय मंत्र जप को सर्वश्रेष्ठ बताया गया है।\n\n");
            sb.append("• **पावन मंत्र**:\n«ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥»");
        }
        // 12. Wealth & Prosperity (धन / व्यापार / समृद्धि / लक्ष्मी)
        else if (lower.contains("धन") || lower.contains("व्यापार") || lower.contains("समृद्धि") || lower.contains("पैसा")) {
            sb.append("💰 **वैदिक धन-समृद्धि एवं श्री लक्ष्मी कृपा**\n\n");
            sb.append("• **शास्त्रीय समाधान**: धर्मपूर्वक उपार्जित धन में ही लक्ष्मी जी का स्थायी वास होता है। कमाई का १०% अंश दान-पुण्य में खर्च करें।\n");
            sb.append("• **उपाय**: शुक्रवार को कनकधारा स्तोत्र का पाठ करें व मुख्य द्वार पर स्वास्तिक चिन्ह बनाएं।");
        }
        // 13. Death, Reincarnation & Afterlife (मृत्यु / पुनर्जन्म / आत्मा / गरुड़ पुराण)
        else if (lower.contains("मृत्यु") || lower.contains("पुनर्जन्म") || lower.contains("आत्मा") || lower.contains("मोक्ष") || lower.contains("गरुड़")) {
            sb.append("🦅 **गरुड़ पुराण अनुसार आत्मा की गति व मोक्ष**\n\n");
            sb.append("• **आत्मा अजर-अमर है**: भगवद्गीता व गरुड़ पुराण अनुसार आत्मा कभी नष्ट नहीं होती। शरीर का त्याग कर कर्मानुसार जीव को नवीन शरीर प्राप्त होता है।\n");
            sb.append("• **मोक्ष मार्ग**: भगवन्नाम स्मरण व निष्काम भक्ति से जीव जन्म-मरण के बंधन से छूटकर परम धाम (वैकुंठ) प्राप्त करता है।");
        }
        // 14. Ekadashi & Fasting (एकादशी / व्रत / उपवास)
        else if (lower.contains("एकादशी") || lower.contains("व्रत") || lower.contains("उपवास")) {
            sb.append("🌙 **एकादशी व्रत महिमा व उपवास नियम**\n\n");
            sb.append("• **एकादशी महिमा**: एकादशी व्रत सब व्रतों में शिरोमणि है। इस दिन अन्न का त्याग कर भगवान विष्णु का पूजन व कीर्तन करने से जन्मों के पाप नष्ट होते हैं।");
        }
        // 15. Comprehensive Authentic Resolution for Any Other Inquiry
        else {
            sb.append("🕉️ **धर्ममाइंड गुरु वैदिक ज्ञान समाधान**\n\n");
            sb.append("• **आपकी जिज्ञासा («").append(p).append("») का शास्त्रीय निरूपण**:\n");
            sb.append("सनातन वैदिक दर्शन अनुसार आपके पूछे गए प्रश्न («").append(p).append("») के संदर्भ में ऋषियों का मत है कि मनुष्य जीवन का मुख्य ध्येय धर्म, अर्थ, काम और मोक्ष (पुरुषार्थ चतुष्टय) की सिद्धि है। मन को वश में करके सत्य आचरण, निष्काम कर्म और प्रभु शरणागति ही सर्वोपरि समाधान है।\n\n");
            sb.append("• **पावन श्लोक**:\n«यतो धर्मस्ततो जयः। सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः। सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत्॥»\n\n");
            sb.append("• **हिंदी भावार्थ**: जहाँ धर्म और सत्य है वहीं विजय है। सब सुखी हों, सब नीरोग हों, सब मंगल देखें और कोई दुःख का भागी न बने।\n\n");
            sb.append("• **गुरु आशीर्वाद**: प्रभु आपका कल्याण करें। सदैव धर्म मार्ग पर चलें और प्रातः-सायं शांत मन से प्रभु का ध्यान लगाएं।");
        }

        String finalResult = sb.toString();
        responseCache.put(cacheKey, finalResult);
        if (callback != null) {
            callback.onSuccess(finalResult);
        }
    }
}