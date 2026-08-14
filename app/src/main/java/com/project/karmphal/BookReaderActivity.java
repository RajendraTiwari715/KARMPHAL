package com.project.karmphal;

import android.content.Intent;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.util.Log;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import java.util.Locale;

public class BookReaderActivity extends AppCompatActivity {
    
    private TextView tvBookTitle, tvBookContent;
    private Button btnPrev, btnNext;
    private ImageButton btnBack, btnSpeak, btnShare, btnChapterSelect;
    private ScrollView scrollView;
    private AIManager aiManager;
    private TextToSpeech tts;
    private int currentChapter = 1;
    private String bookName;
    private String currentContentText = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_book_reader);

        tvBookTitle = findViewById(R.id.tvBookTitle);
        tvBookContent = findViewById(R.id.tvBookContent);
        btnPrev = findViewById(R.id.btnPrev);
        btnNext = findViewById(R.id.btnNext);
        btnBack = findViewById(R.id.btnBack);
        btnSpeak = findViewById(R.id.btnSpeak);
        btnShare = findViewById(R.id.btnShare);
        btnChapterSelect = findViewById(R.id.btnChapterSelect);
        scrollView = findViewById(R.id.scrollView);

        aiManager = AIManager.getInstance(this);
        initTTS();

        bookName = getIntent().getStringExtra("BOOK_NAME");
        if (bookName == null) bookName = "श्रीमद्भगवद्गीता";
        
        tvBookTitle.setText(bookName);

        btnBack.setOnClickListener(v -> finish());

        btnSpeak.setOnClickListener(v -> {
            if (!currentContentText.isEmpty()) {
                speakText(currentContentText);
            } else {
                Toast.makeText(this, "अध्याय लोड हो रहा है...", Toast.LENGTH_SHORT).show();
            }
        });

        btnShare.setOnClickListener(v -> {
            if (!currentContentText.isEmpty()) {
                shareContent(bookName + " - " + getChapterTitle(currentChapter) + "\n\n" + currentContentText);
            }
        });

        btnChapterSelect.setOnClickListener(v -> showChapterSelectionDialog());

        btnPrev.setOnClickListener(v -> {
            if (currentChapter > 1) {
                currentChapter--;
                loadChapter();
            } else {
                Toast.makeText(this, "यह पहला अध्याय है।", Toast.LENGTH_SHORT).show();
            }
        });

        btnNext.setOnClickListener(v -> {
            currentChapter++;
            loadChapter();
        });

        loadChapter();
    }

    private void initTTS() {
        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                int result = tts.setLanguage(new Locale("hi", "IN"));
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    Log.w("BookReader", "Hindi TTS language not fully supported");
                }
            }
        });
    }

    private void speakText(String text) {
        if (tts != null) {
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "BookTTS");
            Toast.makeText(this, "ऑडियो पाठ प्रारंभ हो रहा है...", Toast.LENGTH_SHORT).show();
        }
    }

    private void shareContent(String shareText) {
        Intent sendIntent = new Intent();
        sendIntent.setAction(Intent.ACTION_SEND);
        sendIntent.putExtra(Intent.EXTRA_TEXT, shareText + "\n\n— कर्मफल वैदिक ग्रंथ एवं शास्त्र (Karmphal App)");
        sendIntent.setType("text/plain");
        Intent shareIntent = Intent.createChooser(sendIntent, bookName + " पाठ साझा करें");
        startActivity(shareIntent);
    }

    private String getChapterTitle(int chapterNum) {
        if (bookName.contains("गरुड़") || bookName.contains("Garuda")) {
            String[] garudaChapters = {
                "अध्याय १: प्रेत कल्प व यमलोक यात्रा प्रारंभ (विष्णु-गरुड़ संवाद)", 
                "अध्याय २: पापी आत्माओं की भयानक यम मार्ग यात्रा", 
                "अध्याय ३: यमपुरी वर्णन व धर्मराज की न्याय सभा", 
                "अध्याय ४: वैतरणी नदी पार करने के नियम व गौदान महिमा", 
                "अध्याय ५: यम यातनाएँ, रौरव नरक व पापों का दण्ड", 
                "अध्याय ६: प्रेत योनि मुक्ति विधान व अशौच नियम", 
                "अध्याय ७: दशगात्र पिण्डदान व सपिंडीकरण श्राद्ध", 
                "अध्याय ८: शौच व मरणोत्तर १० दिनों के कृत्य नियम", 
                "अध्याय ९: नवश्राद्ध, पाथेय व दान-पुण्य महिमा", 
                "अध्याय १०: धर्मात्माओं का यमपुरी में स्वागत व दिव्य गति", 
                "अध्याय ११: सुकृत व पातक कर्मफल सिद्धांत", 
                "अध्याय १२: ८४ लाख योनियाँ, परलोक गति व पुनर्जन्म नियम", 
                "अध्याय १३: गया श्राद्ध, तर्पण व एकादशाह कृत्य", 
                "अध्याय १४: वृषोत्सर्ग विधि व दीप दान महात्म्य", 
                "अध्याय १५: जीवनमुक्ति, भगवन्नाम व वैकुंठ लोक प्राप्ति", 
                "अध्याय १६: गरुड़ पुराण सम्पूर्ण पाठ फलश्रुति"
            };
            if (chapterNum <= garudaChapters.length) return garudaChapters[chapterNum - 1];
        } else if (bookName.contains("गीता")) {
            String[] gitaChapters = {
                "अध्याय १: अर्जुनविषादयोग (कुरुक्षेत्र में मोहग्रस्त अर्जुन)", 
                "अध्याय २: सांख्ययोग (आत्मा की अमरता व निष्काम कर्म)", 
                "अध्याय ३: कर्मयोग (कर्म ही जीवन का परम कर्तव्य है)", 
                "अध्याय ४: ज्ञानकर्मसंन्यासयोग (दिव्य ज्ञान व कर्म फल)", 
                "अध्याय ५: कर्मसंन्यासयोग (संन्यास व कर्मयोग का समत्व)", 
                "अध्याय ६: आत्मसंयमयोग (ध्यान योग व मन का नियंत्रण)", 
                "अध्याय ७: ज्ञानविज्ञानयोग (ईश्वर की परा व अपरा प्रकृति)", 
                "अध्याय ८: अक्षरब्रह्मयोग (परम पुरुष परमेश्वर की प्राप्ति)", 
                "अध्याय ९: राजविद्याराजगुह्ययोग (सर्वश्रेष्ठ परम गुह्य ज्ञान)", 
                "अध्याय १०: विभूतियोग (ईश्वर की अनंत दिव्य विभूतियाँ)", 
                "अध्याय ११: विश्वरूपदर्शनयोग (भगवान का विराट रूप)", 
                "अध्याय १२: भक्तियोग (सगुण व निर्गुण परम भक्ति)", 
                "अध्याय १३: क्षेत्रक्षेत्रज्ञविभागयोग (शरीर व आत्मा का ज्ञान)", 
                "अध्याय १४: गुणत्रयविभागयोग (सत्व, रज व तम गुण)", 
                "अध्याय १५: पुरुषोत्तमयोग (संसार वृक्ष व पुरुषोत्तम)", 
                "अध्याय १६: दैवासुरसम्पद्विभागयोग (दैवी व आसुरी संपदा)", 
                "अध्याय १७: श्रद्धात्रयविभागयोग (तीन प्रकार की श्रद्धा)", 
                "अध्याय १८: मोक्षसंन्यासयोग (परम सिद्धि व शरणागति)"
            };
            if (chapterNum <= gitaChapters.length) return gitaChapters[chapterNum - 1];
        } else if (bookName.contains("रामायण") || bookName.contains("रामचरितमानस")) {
            String[] ramayanKandas = {
                "कांड १: बालकाण्ड (श्री राम जन्म, बाल लीला व सीता स्वयंवर)", 
                "कांड २: अयोध्याकाण्ड (श्री राम वनगमन व भरत मिलाप)", 
                "कांड ३: अरण्यकाण्ड (पञ्चवटी निवास व शूर्पणखा प्रसंग)", 
                "कांड ४: किष्किन्धाकाण्ड (सुग्रीव मिताई व हनुमान मिलन)", 
                "कांड ५: सुन्दरकाण्ड (हनुमान लंका दहन व सीता खोज)", 
                "कांड ६: लंकाकाण्ड (समुद्र सेतु निर्माण व रावण वध)", 
                "कांड ७: उत्तरकाण्ड (राम राज्य स्थापना व ज्ञान उपदेश)"
            };
            if (chapterNum <= ramayanKandas.length) return ramayanKandas[chapterNum - 1];
        } else if (bookName.contains("उपनिषद")) {
            String[] upanishads = {
                "१. ईशावास्योपनिषद् (ईश्वर का कण-कण में वास)", 
                "२. केनोपनिषद् (ब्रह्म की परम चेतना व शक्ति)", 
                "३. कठोपनिषद् (नचिकेता-यम संवाद व आत्मज्ञान)", 
                "४. प्रश्नोपनिषद् (सृष्टि उत्पत्ति व प्राण विचार)", 
                "५. मुण्डकोपनिषद् (सत्यमेव जयते व सत्य विद्या)", 
                "६. माण्डूक्योपनिषद् (ॐकार व चेतना की ४ अवस्थाएँ)", 
                "७. तैत्तिरीयोपनिषद् (अन्न, प्राण, मन व आनंदकोश)", 
                "८. ऐतरेयोपनिषद् (आत्मा व सृष्टि रचना)", 
                "९. छान्दोग्योपनिषद् (तत्त्वमसि महावाक्य)", 
                "१०. बृहदारण्यकोपनिषद् (अहम ब्रह्मास्मि व अमरता)"
            };
            if (chapterNum <= upanishads.length) return upanishads[chapterNum - 1];
        } else if (bookName.contains("वेद")) {
            String[] vedas = {
                "भाग १: ऋग्वेद (देवताओं की स्तुति व ज्ञान सूक्त)", 
                "भाग २: यजुर्वेद (यज्ञ, कर्मकांड व गद्य मंत्र)", 
                "भाग ३: सामवेद (गायन योग्य दिव्य संगीत मंत्र)", 
                "भाग ४: अथर्ववेद (औषधि, विज्ञान व दैनिक जीवन मंत्र)"
            };
            if (chapterNum <= vedas.length) return vedas[chapterNum - 1];
        } else if (bookName.contains("शिव")) {
            String[] shivaPuran = {
                "खंड १: विद्येश्वर संहिता (शिव लिंग पूजन व भस्म महिमा)", 
                "खंड २: रुद्र संहिता - सती खंड (शिव-पार्वती विवाह)", 
                "खंड ३: रुद्र संहिता - पार्वती खंड (तारकासुर वध)", 
                "खंड ४: शतविद्वेश्वर व कोटिरुद्र संहिता (१२ ज्योतिर्लिंग)", 
                "खंड ५: उमा व कैलाश संहिता (शिव तांडव व ज्ञान)", 
                "खंड ६: वायवीय संहिता (शिव भक्ति व मोक्ष नियम)"
            };
            if (chapterNum <= shivaPuran.length) return shivaPuran[chapterNum - 1];
        }
        return bookName + " - अध्याय/भाग " + chapterNum;
    }

    private void showChapterSelectionDialog() {
        int maxChapters = 16;
        if (bookName.contains("गीता")) maxChapters = 18;
        else if (bookName.contains("रामायण") || bookName.contains("रामचरितमानस")) maxChapters = 7;
        else if (bookName.contains("उपनिषद")) maxChapters = 10;
        else if (bookName.contains("वेद")) maxChapters = 4;
        else if (bookName.contains("शिव")) maxChapters = 6;

        String[] chapters = new String[maxChapters];
        for (int i = 0; i < maxChapters; i++) {
            chapters[i] = getChapterTitle(i + 1);
        }

        new AlertDialog.Builder(this)
                .setTitle(bookName + " - अध्याय/काण्ड चुनें")
                .setItems(chapters, (dialog, which) -> {
                    currentChapter = which + 1;
                    loadChapter();
                })
                .show();
    }

    private void loadChapter() {
        String chTitle = getChapterTitle(currentChapter);
        tvBookTitle.setText(bookName + " - " + chTitle);
        tvBookContent.setText("शास्त्रीय मंथन हो रहा है... " + bookName + " के " + chTitle + " की सम्पूर्ण व्यक्तिगत मूल कथा, श्लोक व भावार्थ लोड हो रहे हैं।");
        currentContentText = "";
        btnPrev.setEnabled(false);
        btnNext.setEnabled(false);
        
        String prompt = "मुझे " + bookName + " के " + chTitle + " की संपूर्ण व्यक्तिगत मूल कथा, ऐतिहासिक प्रसंग, मूल संस्कृत श्लोक, पदच्छेद, शब्दार्थ, हिंदी अनुवाद तथा जीवनोपयोगी भावार्थ विस्तार से हिंदी में प्रदान करें।";
        String systemInstruction = "You are a master Vedic scholar, Purana expert and Sanskrit authority in Karmphal app. Provide the complete, accurate, authentic narrative story for " + bookName + " (" + chTitle + "), original Sanskrit shloks, Hindi translation, and philosophical commentary in beautiful markdown formatting.";

        aiManager.askAI(prompt, systemInstruction, null, new AIManager.AICallback() {
            @Override
            public void onSuccess(String responseText) {
                runOnUiThread(() -> {
                    currentContentText = responseText;
                    tvBookContent.setText(responseText);
                    scrollView.smoothScrollTo(0, 0);
                    btnPrev.setEnabled(true);
                    btnNext.setEnabled(true);
                });
            }

            @Override
            public void onError(Throwable throwable) {
                runOnUiThread(() -> {
                    String fallbackText = generateAuthenticBookFallback(bookName, chTitle);
                    currentContentText = fallbackText;
                    tvBookContent.setText(fallbackText);
                    scrollView.smoothScrollTo(0, 0);
                    btnPrev.setEnabled(true);
                    btnNext.setEnabled(true);
                });
            }
        });
    }

    private String generateAuthenticBookFallback(String bName, String cTitle) {
        StringBuilder sb = new StringBuilder();
        sb.append("📖 **").append(bName).append(" - ").append(cTitle).append("**\n\n");

        if (bName.contains("गीता")) {
            sb.append("• **अध्याय की मुख्य कथा व सार**:\n");
            sb.append("श्रीमद्भगवद्गीता के इस पावन अध्याय में योगेश्वर श्री कृष्ण अर्जुन को निष्काम कर्मयोग, आत्मा की अजर-अमरता तथा स्वधर्म पालन का परम उपदेश देते हैं। भगवान कहते हैं कि फल की चिंता त्याग कर सत्य और कर्तव्य के पथ पर दृढ़ता से आगे बढ़ो।\n\n");
            sb.append("• **पावन श्लोक**:\n«कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥»\n\n");
            sb.append("• **हिंदी भावार्थ**: तेरा अधिकार केवल कर्म करने में है, उसके फलों में कभी नहीं। इसलिए तू कर्मों के फल का हेतु मत बन और तेरी कर्म न करने में भी आसक्ति न हो।\n\n");
            sb.append("• **जीवनोपयोगी संदेश**: अपने कर्तव्यों का निष्ठापूर्वक पालन करें और सुख-दुःख, जय-पराजय में समभाव बनाए रखें।");
        } else if (bName.contains("रामायण") || bName.contains("रामचरितमानस")) {
            sb.append("• **काण्ड की पावन कथा व प्रसंग**:\n");
            sb.append("श्री रामायण के इस काण्ड में मर्यादा पुरुषोत्तम भगवान श्री राम के आदर्श जीवन, सत्य निष्ठा, पितृ आज्ञा पालन तथा धर्म की विजय गाथा का भावपूर्ण वर्णन है। भक्त शिरोमणि श्री हनुमान जी की अतुलित भक्ति और राम नाम की महिमा का गुणगान किया गया है।\n\n");
            sb.append("• **पावन चौपाई**:\n«राम नाम मनिदीप धरु जीह देहरीं द्वार।\nतुलसी भीतर बाहिरहुँ जौं चाहसि उजिआर॥»\n\n");
            sb.append("• **हिंदी भावार्थ**: यदि तुम अपने भीतर और बाहर दोनों ओर प्रकाश चाहते हो, तो जीभ रूपी देहरी के द्वार पर राम-नाम रूपी मणियों का दीपक रखो।\n\n");
            sb.append("• **जीवनोपयोगी संदेश**: सदा सत्य, धर्म और मर्यादा का पालन करते हुए ईश्वर पर अटूट विश्वास रखें।");
        } else if (bName.contains("शिव")) {
            sb.append("• **शिव पुराण कथा व महिमा**:\n");
            sb.append("शिव पुराण के इस पावन भाग में देवाधिदेव महादेव की अगाध महिमा, शिव-पार्वती कल्याण प्रसंग, भस्म व रुद्राक्ष धारण महात्म्य तथा १२ ज्योतिर्लिंगों के प्राकट्य का पावन विवरण प्राप्त होता है।\n\n");
            sb.append("• **पावन श्लोक**:\n«कर्पूरगौरं करुणावतारं संसारसारम् भुजगेन्द्रहारम्।\nसदावसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥»\n\n");
            sb.append("• **हिंदी भावार्थ**: जो कर्पूर के समान गौर वर्ण वाले हैं, करुणा के अवतार हैं, संसार के सार हैं और सर्पों का हार धारण करते हैं, उन भगवान शिव को माता भवानी सहित प्रणाम है।");
        } else if (bName.contains("वेद") || bName.contains("उपनिषद")) {
            sb.append("• **वैदिक संहिता व ज्ञान मंथन**:\n");
            sb.append("इस पावन ग्रंथ में वैदिक ऋषियों द्वारा दृष्ट मंत्र, ब्रह्म ज्ञान, सृष्टि उत्पत्ति एवं आत्म-साक्षात्कार का परम गूढ़ उपदेश निहित है। यह ज्ञान मनुष्य को अज्ञान के अंधकार से मोक्ष के प्रकाश की ओर ले जाता है।\n\n");
            sb.append("• **पावन मंत्र**:\n«ॐ असतो मा सद्गमय। तमसो मा ज्योतिर्गमय। मृत्योर्मा अमृतं गमय॥»\n\n");
            sb.append("• **हिंदी भावार्थ**: हे प्रभु! मुझे असत्य से सत्य की ओर ले चलो, अंधकार से प्रकाश की ओर ले चलो और मृत्यु से अमरता की ओर ले चलो।");
        } else {
            sb.append("• **अध्याय का पावन शास्त्रीय विवरण**:\n");
            sb.append("गरुड़ पुराण (प्रेत कल्प) के इस अध्याय में भगवान श्री हरि विष्णु पक्षीराज गरुड़ को मरणोत्तर आत्मा की गति, पाप-पुण्य का सूक्ष्म लेखा-जोखा तथा वैकुंठ लोक प्राप्ति के सुगम उपाय बताते हैं।\n\n");
            sb.append("• **मूल श्लोक व भावार्थ**:\n«न हि कश्चित्क्षणमपि जातु तिष्ठत्यकर्मकृत्» - मनुष्य एक क्षण भी कर्म किए बिना नहीं रह सकता। सदैव शुभ कर्मों का आचरण करें।");
        }
        return sb.toString();
    }

    @Override
    protected void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        super.onDestroy();
    }
}
