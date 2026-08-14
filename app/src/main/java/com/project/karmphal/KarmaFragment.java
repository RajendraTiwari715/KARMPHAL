package com.project.karmphal;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.google.android.material.card.MaterialCardView;

public class KarmaFragment extends Fragment {

    private Button btnKarmaLedger;
    private MaterialCardView cardKarmaResult;
    private TextView tvKarmaResult;
    private AIManager aiManager;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_karma, container, false);

        btnKarmaLedger = view.findViewById(R.id.btnKarmaLedger);
        cardKarmaResult = view.findViewById(R.id.cardKarmaResult);
        tvKarmaResult = view.findViewById(R.id.tvKarmaResult);
        aiManager = AIManager.getInstance(getContext());

        MaterialCardView cardGaruda = view.findViewById(R.id.cardGaruda);
        MaterialCardView cardGarudaSecrets = view.findViewById(R.id.cardGarudaSecrets);
        MaterialCardView cardPrayashchit = view.findViewById(R.id.cardPrayashchit);
        MaterialCardView cardKarmaSiddhant = view.findViewById(R.id.cardKarmaSiddhant);

        if (btnKarmaLedger != null) {
            btnKarmaLedger.setOnClickListener(v -> calculateKarmaBalance());
        }

        if (cardGaruda != null) cardGaruda.setOnClickListener(v -> openBook("सम्पूर्ण गरुड़ पुराण (16 अध्याय व प्रेत कल्प)"));
        if (cardGarudaSecrets != null) cardGarudaSecrets.setOnClickListener(v -> openBook("गरुड़ पुराण के गूढ़ रहस्य एवं परलोक गति"));
        if (cardPrayashchit != null) cardPrayashchit.setOnClickListener(v -> openBook("अपराध निदान एवं प्रायश्चित्त विधान"));
        if (cardKarmaSiddhant != null) cardKarmaSiddhant.setOnClickListener(v -> openBook("कर्म फल सिद्धांत (संचित, प्रारब्ध व क्रियमाण)"));

        return view;
    }

    private void calculateKarmaBalance() {
        if (cardKarmaResult != null && tvKarmaResult != null) {
            cardKarmaResult.setVisibility(View.VISIBLE);
            tvKarmaResult.setText("आपके कर्म खाते (Karma Ledger) का विश्लेषण किया जा रहा है...");

            String prompt = "मुझे वैदिक कर्म सिद्धांत के अनुसार कर्म लेखा-जोखा (Karma Ledger), संचित-प्रारब्ध कर्म का संतुलन और दैनिक जीवन में शुभाशुभ कर्मों की शुद्धि का मार्गदर्शन संक्षेप में हिंदी में बताएं।";
            String systemInstruction = "You are a wise Karmic Scholar and Astrologer in Karmphal app. Provide a precise, encouraging, and highly spiritual guide on Karma Ledger, balance of deeds, and purification of past errors in clear Hindi bullet points.";

            aiManager.askAI(prompt, systemInstruction, null, new AIManager.AICallback() {
                @Override
                public void onSuccess(String responseText) {
                    if (getActivity() == null) return;
                    getActivity().runOnUiThread(() -> tvKarmaResult.setText(responseText));
                }

                @Override
                public void onError(Throwable throwable) {
                    if (getActivity() == null) return;
                    getActivity().runOnUiThread(() -> tvKarmaResult.setText("त्रुटि: " + throwable.getMessage()));
                }
            });
        }
    }

    private void openBook(String bookName) {
        if (getActivity() != null) {
            Intent intent = new Intent(getActivity(), BookReaderActivity.class);
            intent.putExtra("BOOK_NAME", bookName);
            startActivity(intent);
        }
    }
}
