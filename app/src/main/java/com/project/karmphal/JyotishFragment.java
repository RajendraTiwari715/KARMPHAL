package com.project.karmphal;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.google.android.material.card.MaterialCardView;
import com.google.android.material.chip.Chip;

public class JyotishFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_jyotish, container, false);

        setupFeatureCards(view);
        setupRashiChips(view);

        Button btnGenerateKundli = view.findViewById(R.id.btnGenerateKundli);
        if (btnGenerateKundli != null) {
            btnGenerateKundli.setOnClickListener(v -> openJyotishDetail(JyotishDetailActivity.TYPE_KUNDALI, "संपूर्ण जन्म कुंडली फलादेश (२-५ पृष्ठ)"));
        }

        return view;
    }

    private void setupFeatureCards(View view) {
        MaterialCardView cardKundaliTab = view.findViewById(R.id.cardKundaliTab);
        MaterialCardView cardVivahMilan = view.findViewById(R.id.cardVivahMilan);
        MaterialCardView cardVastuUpay = view.findViewById(R.id.cardVastuUpay);
        MaterialCardView cardLalKitab = view.findViewById(R.id.cardLalKitab);

        if (cardKundaliTab != null) {
            cardKundaliTab.setOnClickListener(v -> openJyotishDetail(JyotishDetailActivity.TYPE_KUNDALI, "संपूर्ण २ से ५ पेज जन्म कुंडली विवरण"));
        }
        if (cardVivahMilan != null) {
            cardVivahMilan.setOnClickListener(v -> openJyotishDetail(JyotishDetailActivity.TYPE_VIVAH_MILAN, "वर-वधू सम्पूर्ण ३६ गुण विवाह अष्टकूट मिलान"));
        }
        if (cardVastuUpay != null) {
            cardVastuUpay.setOnClickListener(v -> openJyotishDetail(JyotishDetailActivity.TYPE_VASTU, "वास्तु दोष, दिशा ज्ञान एवं लाइव कंपास"));
        }
        if (cardLalKitab != null) {
            cardLalKitab.setOnClickListener(v -> openJyotishDetail(JyotishDetailActivity.TYPE_LAL_KITAB, "लाल किताब सिद्ध टोटके व अचूक उपाय"));
        }
    }

    private void setupRashiChips(View view) {
        int[] chipIds = {
            R.id.chipMesh, R.id.chipVrishabha, R.id.chipMithun, R.id.chipKarka,
            R.id.chipSimha, R.id.chipKanya, R.id.chipTula, R.id.chipVrishchika,
            R.id.chipDhanu, R.id.chipMakar, R.id.chipKumbha, R.id.chipMeen
        };

        for (int id : chipIds) {
            Chip chip = view.findViewById(id);
            if (chip != null) {
                chip.setOnClickListener(v -> {
                    String rashi = chip.getText().toString();
                    Intent intent = new Intent(getActivity(), JyotishDetailActivity.class);
                    intent.putExtra(JyotishDetailActivity.EXTRA_FEATURE_TYPE, JyotishDetailActivity.TYPE_RASHIFAL);
                    intent.putExtra(JyotishDetailActivity.EXTRA_FEATURE_TITLE, rashi + " - दैनिक राशिफल");
                    intent.putExtra(JyotishDetailActivity.EXTRA_RASHI_NAME, rashi);
                    startActivity(intent);
                });
            }
        }
    }

    private void openJyotishDetail(String featureType, String title) {
        if (getActivity() == null) return;
        Intent intent = new Intent(getActivity(), JyotishDetailActivity.class);
        intent.putExtra(JyotishDetailActivity.EXTRA_FEATURE_TYPE, featureType);
        intent.putExtra(JyotishDetailActivity.EXTRA_FEATURE_TITLE, title);
        startActivity(intent);
    }
}
