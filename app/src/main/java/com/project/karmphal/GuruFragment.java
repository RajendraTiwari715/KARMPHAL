package com.project.karmphal;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.text.TextUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.ai.client.generativeai.type.Content;
import com.google.android.material.chip.Chip;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class GuruFragment extends Fragment {

    private RecyclerView rvChat;
    private EditText etInput;
    private ImageButton btnSend;
    private Chip chipKundali, chipPrayashchit, chipGaruda, chipThought, chipKrishnaImage;
    
    private ChatAdapter chatAdapter;
    private List<ChatMessage> messageList;
    private List<Content> aiHistory;
    private AIManager aiManager;
    private TextToSpeech tts;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_guru, container, false);
        
        rvChat = view.findViewById(R.id.rvChat);
        etInput = view.findViewById(R.id.etInput);
        btnSend = view.findViewById(R.id.btnSend);

        chipKundali = view.findViewById(R.id.chipKundali);
        chipPrayashchit = view.findViewById(R.id.chipPrayashchit);
        chipGaruda = view.findViewById(R.id.chipGaruda);
        chipThought = view.findViewById(R.id.chipThought);
        chipKrishnaImage = view.findViewById(R.id.chipKarma);

        messageList = new ArrayList<>();
        aiHistory = new ArrayList<>();
        chatAdapter = new ChatAdapter(messageList);

        LinearLayoutManager layoutManager = new LinearLayoutManager(getContext());
        layoutManager.setStackFromEnd(true);
        rvChat.setLayoutManager(layoutManager);
        rvChat.setAdapter(chatAdapter);

        // Initialize Text to Speech engine
        initTTS();

        chatAdapter.setOnSpeakClickListener(this::speakText);
        chatAdapter.setOnImageShareClickListener(this::shareImage);
        chatAdapter.setOnImageDownloadClickListener(this::downloadImage);

        aiManager = AIManager.getInstance(getContext());

        // Add welcome message
        addMessage("प्रणाम! मैं धर्ममाइंड गुरु हूँ। आप मुझसे वेद, उपनिषद, गीता, गरुड़ पुराण, कर्म विधान, प्रायश्चित्त उपाय, जन्म कुंडली या किसी भी देव स्वरूप का चित्र दर्शन प्राप्त कर सकते हैं।", false, null);

        btnSend.setOnClickListener(v -> sendMessage(etInput.getText().toString().trim()));

        setupChips();

        return view;
    }

    private void initTTS() {
        tts = new TextToSpeech(getContext(), status -> {
            if (status == TextToSpeech.SUCCESS) {
                int result = tts.setLanguage(new Locale("hi", "IN"));
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    Log.w("GuruFragment", "Hindi TTS language is not fully supported on device.");
                }
            }
        });
    }

    private void speakText(String text) {
        if (tts != null) {
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "GuruTTS");
        }
    }

    private void shareImage(String imageUrl, String text) {
        if (getContext() == null) return;
        Intent sendIntent = new Intent();
        sendIntent.setAction(Intent.ACTION_SEND);
        sendIntent.putExtra(Intent.EXTRA_TEXT, text + "\n\nदिव्य छवि लिंक: " + imageUrl + "\n— कर्मफल गुरु ऐप (Karmphal)");
        sendIntent.setType("text/plain");
        startActivity(Intent.createChooser(sendIntent, "दिव्य छवि साझा करें"));
    }

    private void downloadImage(String imageUrl, String text) {
        if (getContext() == null) return;
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(imageUrl));
            startActivity(intent);
            Toast.makeText(getContext(), "छवि ब्राउज़र में खोली जा रही है...", Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            Toast.makeText(getContext(), "डाउनलोड लिंक: " + imageUrl, Toast.LENGTH_LONG).show();
        }
    }

    private void setupChips() {
        if (chipKundali != null) chipKundali.setOnClickListener(v -> sendMessage("कृपया मुझे वैदिक ज्योतिष के अनुसार कुंडली फलादेश, नवग्रह स्थिति और गृह शांति के मुख्य उपाय बताएं।"));
        if (chipPrayashchit != null) chipPrayashchit.setOnClickListener(v -> sendMessage("शास्त्रसम्मत पाप-अपराध निदान और उनके निवारण हेतु प्रायश्चित्त विधान व जप-दान नियम क्या हैं?"));
        if (chipGaruda != null) chipGaruda.setOnClickListener(v -> sendMessage("गरुड़ पुराण के अनुसार मृत्यु के पश्चात आत्मा की गति, यमलोक यात्रा और कर्मफल रहस्य क्या हैं?"));
        if (chipThought != null) chipThought.setOnClickListener(v -> sendMessage("कृपया मुझे आज का एक बहुत सुंदर वैदिक श्लोक, उसका हिंदी अर्थ और प्रेरणादायक सुविचार बताएं।"));
        if (chipKrishnaImage != null) {
            chipKrishnaImage.setText("🖼️ श्री कृष्ण दर्शन छवि");
            chipKrishnaImage.setOnClickListener(v -> sendMessage("भगवान श्री कृष्ण के मनमोहक बाल स्वरूप का चित्र दर्शन कराएं"));
        }
    }

    private void sendMessage(String text) {
        if (TextUtils.isEmpty(text)) return;

        etInput.setText("");
        addMessage(text, true, null);

        // Check if image generation is requested
        boolean isImageRequest = isImageGenerationRequested(text);
        String imageUrl = null;
        if (isImageRequest) {
            imageUrl = generateSpiritualImageUrl(text);
        }

        final String finalImageUrl = imageUrl;

        // Deeply Trained Spiritual & Astrological Guru Prompt with Image Capability
        String systemInstruction = "You are DharmMind Guru, a deeply revered, all-knowing Hindu Spiritual Master, Vedic Astrologer, and Divine Visualizer in Karmphal app. "
            + "You hold absolute mastery over: "
            + "1. All Sacred Hindu Texts: Vedas, 108 Upanishads, Bhagavad Gita, Valmiki Ramayana, Ramcharitmanas, Mahabharata, and all 18 Puranas (especially Garuda Purana, Shiva Purana, Bhagavata Purana). "
            + "2. Vedic Astrology & Kundali Faladesh: Lagna, Rashi, Nakshatra, Dasha, Gochar, Manglik & Kalsarp Dosh, Astro Remedies, Gemstones. "
            + "3. Divine Visualizations: When user asks for a deity image or visual (जैसे चित्र, फोटो, दर्शन, छवि), describe the divine beauty poetically in Hindi. "
            + "Always answer with absolute authority, wisdom, politeness, and poetic spiritual brilliance in Hindi.";

        btnSend.setEnabled(false);
        aiManager.askAI(text, systemInstruction, aiHistory, new AIManager.AICallback() {
            @Override
            public void onSuccess(String responseText) {
                if (getActivity() == null) return;
                getActivity().runOnUiThread(() -> {
                    addMessage(responseText, false, finalImageUrl);
                    btnSend.setEnabled(true);
                    
                    // Update History
                    Content.Builder userCb = new Content.Builder();
                    userCb.setRole("user");
                    userCb.addText(text);
                    aiHistory.add(userCb.build());
                    
                    Content.Builder aiCb = new Content.Builder();
                    aiCb.setRole("model");
                    aiCb.addText(responseText);
                    aiHistory.add(aiCb.build());
                });
            }

            @Override
            public void onError(Throwable throwable) {
                if (getActivity() == null) return;
                getActivity().runOnUiThread(() -> {
                    addMessage("जय श्री कृष्णा! " + text + " का दिव्य सार:\n\n• सत्कर्म ही सर्वोपरि धर्म है। ईश्वर की कृपा सदैव आप पर बनी रहे।", false, finalImageUrl);
                    btnSend.setEnabled(true);
                });
            }
        });
    }

    private boolean isImageGenerationRequested(String text) {
        String lower = text.toLowerCase();
        return lower.contains("चित्र") || lower.contains("दर्शन") || lower.contains("छवि") || lower.contains("फोटो") || lower.contains("यंत्र") || lower.contains("तस्वीर") || lower.contains("image") || lower.contains("picture");
    }

    private String generateSpiritualImageUrl(String text) {
        try {
            String query = "hindu deity " + text + " divine golden light realistic 8k";
            String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8.name());
            return "https://image.pollinations.ai/prompt/" + encoded + "?width=800&height=600&nologo=true";
        } catch (Exception e) {
            return "https://image.pollinations.ai/prompt/hindu%20god%20divine%20golden%20light?width=800&height=600&nologo=true";
        }
    }

    private void addMessage(String text, boolean isUser, String imageUrl) {
        messageList.add(new ChatMessage(text, isUser, imageUrl));
        chatAdapter.notifyItemInserted(messageList.size() - 1);
        rvChat.scrollToPosition(messageList.size() - 1);
    }

    @Override
    public void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        super.onDestroy();
    }
}
