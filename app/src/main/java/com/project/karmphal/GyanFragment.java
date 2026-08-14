package com.project.karmphal;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.google.android.material.card.MaterialCardView;

public class GyanFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_gyan, container, false);

        // Vedas, Upanishads & Darshana
        MaterialCardView cardVedas = view.findViewById(R.id.cardVedas);
        MaterialCardView cardUpanishads = view.findViewById(R.id.cardUpanishads);
        MaterialCardView cardDarshana = view.findViewById(R.id.cardDarshana);

        // Epics & Puranas
        MaterialCardView cardGita = view.findViewById(R.id.cardGita);
        MaterialCardView cardBhagavata = view.findViewById(R.id.cardBhagavata);
        MaterialCardView cardRamayana = view.findViewById(R.id.cardRamayana);
        MaterialCardView cardRamcharitmanas = view.findViewById(R.id.cardRamcharitmanas);
        MaterialCardView cardMahabharata = view.findViewById(R.id.cardMahabharata);
        MaterialCardView cardShivaPuran = view.findViewById(R.id.cardShivaPuran);

        // Niti Shastras & Ethics
        MaterialCardView cardVidur = view.findViewById(R.id.cardVidur);
        MaterialCardView cardChanakya = view.findViewById(R.id.cardChanakya);
        MaterialCardView cardBhartrihari = view.findViewById(R.id.cardBhartrihari);
        MaterialCardView cardShukraNiti = view.findViewById(R.id.cardShukraNiti);

        // Stotram & Chalisa
        MaterialCardView cardHanuman = view.findViewById(R.id.cardHanuman);
        MaterialCardView cardShivaStotram = view.findViewById(R.id.cardShivaStotram);

        if (cardVedas != null) cardVedas.setOnClickListener(v -> openBook("चार वेद (ऋग्वेद, यजुर्वेद, सामवेद, अथर्ववेद)"));
        if (cardUpanishads != null) cardUpanishads.setOnClickListener(v -> openBook("108 उपनिषद (ईश, केन, कठ, मुण्डक, मांडूक्य)"));
        if (cardDarshana != null) cardDarshana.setOnClickListener(v -> openBook("षड्दर्शन (सांख्य, योग, न्याय, वैशेषिक, मीमांसा, वेदांत)"));

        if (cardGita != null) cardGita.setOnClickListener(v -> openBook("श्रीमद्भगवद्गीता"));
        if (cardBhagavata != null) cardBhagavata.setOnClickListener(v -> openBook("श्रीमद्भागवत पुराण"));
        if (cardRamayana != null) cardRamayana.setOnClickListener(v -> openBook("वाल्मीकि रामायण"));
        if (cardRamcharitmanas != null) cardRamcharitmanas.setOnClickListener(v -> openBook("श्री रामचरितमानस"));
        if (cardMahabharata != null) cardMahabharata.setOnClickListener(v -> openBook("महाभारत"));
        if (cardShivaPuran != null) cardShivaPuran.setOnClickListener(v -> openBook("शिव पुराण"));

        if (cardVidur != null) cardVidur.setOnClickListener(v -> openBook("विदुर नीति"));
        if (cardChanakya != null) cardChanakya.setOnClickListener(v -> openBook("चाणक्य नीति"));
        if (cardBhartrihari != null) cardBhartrihari.setOnClickListener(v -> openBook("भर्तृहरि नीतिशतक"));
        if (cardShukraNiti != null) cardShukraNiti.setOnClickListener(v -> openBook("शुक्र नीति"));

        if (cardHanuman != null) cardHanuman.setOnClickListener(v -> openBook("हनुमान चालीसा एवं बजरंग बाण"));
        if (cardShivaStotram != null) cardShivaStotram.setOnClickListener(v -> openBook("शिव तांडव स्तोत्र एवं रुद्राष्टकम"));

        return view;
    }

    private void openBook(String bookName) {
        if (getActivity() != null) {
            Intent intent = new Intent(getActivity(), BookReaderActivity.class);
            intent.putExtra("BOOK_NAME", bookName);
            startActivity(intent);
        }
    }
}
