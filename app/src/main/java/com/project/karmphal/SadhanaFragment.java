package com.project.karmphal;

import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.os.Vibrator;
import android.os.VibrationEffect;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.google.android.material.card.MaterialCardView;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class SadhanaFragment extends Fragment {
    private TextView tvDate, tvTithi, tvNakshatra, tvYoga, tvMuhurat;
    private TextView tvMalaCount, tvCompletedMalas;
    private Button btnRefreshPanchang, btnJaapTap, btnResetJaap;
    private MaterialCardView cardMuhurat;
    private AIManager aiManager;
    private Vibrator vibrator;

    private int currentJaapCount = 0;
    private int completedMalas = 0;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_sadhana, container, false);
        
        tvDate = view.findViewById(R.id.tvDate);
        tvTithi = view.findViewById(R.id.tvTithi);
        tvNakshatra = view.findViewById(R.id.tvNakshatra);
        tvYoga = view.findViewById(R.id.tvYoga);
        tvMuhurat = view.findViewById(R.id.tvMuhurat);
        
        tvMalaCount = view.findViewById(R.id.tvMalaCount);
        tvCompletedMalas = view.findViewById(R.id.tvCompletedMalas);
        
        btnRefreshPanchang = view.findViewById(R.id.btnRefreshPanchang);
        btnJaapTap = view.findViewById(R.id.btnJaapTap);
        btnResetJaap = view.findViewById(R.id.btnResetJaap);
        
        cardMuhurat = view.findViewById(R.id.cardMuhurat);
        aiManager = AIManager.getInstance(getContext());
        
        if (getContext() != null) {
            vibrator = (Vibrator) getContext().getSystemService(Context.VIBRATOR_SERVICE);
        }

        updateSadhanaData();
        setupJaapCounter();

        btnRefreshPanchang.setOnClickListener(v -> fetchMuhurat());

        return view;
    }

    private void updateSadhanaData() {
        String currentDate = new SimpleDateFormat("EEEE, dd MMMM yyyy", new Locale("hi", "IN")).format(new Date());
        tvDate.setText(currentDate);
        tvTithi.setText("शुभ तिथि: सूर्योदय कालीन तिथि");
        tvNakshatra.setText("आज का नक्षत्र: शुभ नक्षत्र गोचर");
        tvYoga.setText("शुभ योग: सिद्ध एवं साध्य योग");
    }

    private void setupJaapCounter() {
        updateCounterUI();

        btnJaapTap.setOnClickListener(v -> {
            currentJaapCount++;
            triggerHaptic();

            if (currentJaapCount >= 108) {
                completedMalas++;
                currentJaapCount = 0;
                Toast.makeText(getContext(), "अति उत्तम! 1 माला (108 मंत्र) पूर्ण हुई। 🚩", Toast.LENGTH_LONG).show();
            }
            updateCounterUI();
        });

        btnResetJaap.setOnClickListener(v -> {
            currentJaapCount = 0;
            updateCounterUI();
            Toast.makeText(getContext(), "जाप काउंटर रीसेट किया गया", Toast.LENGTH_SHORT).show();
        });
    }

    private void updateCounterUI() {
        if (tvMalaCount != null) {
            tvMalaCount.setText("जाप: " + currentJaapCount + " / 108");
        }
        if (tvCompletedMalas != null) {
            tvCompletedMalas.setText("कुल मालाएँ पूर्ण: " + completedMalas);
        }
    }

    private void triggerHaptic() {
        if (vibrator != null && vibrator.hasVibrator()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(40, VibrationEffect.DEFAULT_AMPLITUDE));
            } else {
                vibrator.vibrate(40);
            }
        }
    }

    private void fetchMuhurat() {
        btnRefreshPanchang.setEnabled(false);
        btnRefreshPanchang.setText("ज्योतिषीय मुहूर्त निकाला जा रहा है...");
        cardMuhurat.setVisibility(View.VISIBLE);
        tvMuhurat.setText("कृपया प्रतीक्षा करें, आज का सूर्योदय, राहु काल और अभिजीत मुहूर्त निकाला जा रहा है...");

        String prompt = "आज " + tvDate.getText().toString() + " है। मुझे आज का सटीक हिंदू पंचांग (तिथि, नक्षत्र, सूर्योदय समय, अभिजीत मुहूर्त, राहु काल और चौघड़िया) हिंदी में स्पष्ट बिंदुवार बताएं।";
        String systemInstruction = "You are a highly detailed Vedic astrologer. Provide accurate daily panchang details, rahukaal, and abhijit muhurat for the requested date in clean Hindi formatting with bullet points.";

        aiManager.askAI(prompt, systemInstruction, null, new AIManager.AICallback() {
            @Override
            public void onSuccess(String responseText) {
                if (getActivity() == null) return;
                getActivity().runOnUiThread(() -> {
                    tvMuhurat.setText(responseText);
                    btnRefreshPanchang.setText("मुहूर्त अपडेट करें");
                    btnRefreshPanchang.setEnabled(true);
                });
            }

            @Override
            public void onError(Throwable throwable) {
                if (getActivity() == null) return;
                getActivity().runOnUiThread(() -> {
                    tvMuhurat.setText("त्रुटि: " + throwable.getMessage());
                    btnRefreshPanchang.setText("पुनः प्रयास करें");
                    btnRefreshPanchang.setEnabled(true);
                });
            }
        });
    }
}
