package com.project.karmphal;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.ImageButton;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.app.AppCompatDelegate;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.switchmaterial.SwitchMaterial;
import com.google.android.material.textfield.TextInputEditText;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;

import java.util.HashMap;
import java.util.Map;

public class ProfileActivity extends AppCompatActivity {

    private TextInputEditText etName;
    private AutoCompleteTextView etRashi;
    private TextView tvUserEmail;
    private MaterialButton btnUpdateProfile, btnDeleteAccount;
    private ImageButton btnBack;
    private SwitchMaterial switchDarkMode;
    private Spinner spinnerLanguage;

    private FirebaseAuth mAuth;
    private DatabaseReference mDatabase;
    private SharedPreferences prefs;

    private final String[] rashis = {"Mesh (Aries)", "Vrishabha (Taurus)", "Mithun (Gemini)", 
                                     "Karka (Cancer)", "Simha (Leo)", "Kanya (Virgo)", 
                                     "Tula (Libra)", "Vrishchika (Scorpio)", "Dhanu (Sagittarius)", 
                                     "Makar (Capricorn)", "Kumbha (Aquarius)", "Meen (Pisces)"};

    private final String[] languages = {"हिंदी (Hindi)", "English", "संस्कृत (Sanskrit)"};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        mAuth = FirebaseAuth.getInstance();
        mDatabase = FirebaseDatabase.getInstance().getReference("users");
        prefs = getSharedPreferences("KarmphalSettings", MODE_PRIVATE);

        initViews();
        loadUserData();
        setupListeners();
    }

    private void initViews() {
        etName = findViewById(R.id.etName);
        etRashi = findViewById(R.id.etRashi);
        tvUserEmail = findViewById(R.id.tvUserEmail);
        btnUpdateProfile = findViewById(R.id.btnUpdateProfile);
        btnDeleteAccount = findViewById(R.id.btnDeleteAccount);
        btnBack = findViewById(R.id.btnBack);
        switchDarkMode = findViewById(R.id.switchDarkMode);
        spinnerLanguage = findViewById(R.id.spinnerLanguage);

        ArrayAdapter<String> rashiAdapter = new ArrayAdapter<>(this, android.R.layout.simple_dropdown_item_1line, rashis);
        etRashi.setAdapter(rashiAdapter);

        ArrayAdapter<String> langAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, languages);
        spinnerLanguage.setAdapter(langAdapter);

        boolean isDarkMode = prefs.getBoolean("dark_mode", true);
        switchDarkMode.setChecked(isDarkMode);
    }

    private void loadUserData() {
        FirebaseUser user = mAuth.getCurrentUser();
        if (user != null) {
            tvUserEmail.setText(user.getEmail());
            mDatabase.child(user.getUid()).get().addOnSuccessListener(snapshot -> {
                if (snapshot.exists()) {
                    String name = snapshot.child("full_name").getValue(String.class);
                    String rashi = snapshot.child("rashi").getValue(String.class);
                    if (name != null) etName.setText(name);
                    if (rashi != null) etRashi.setText(rashi, false);
                }
            });
        }
    }

    private void setupListeners() {
        btnBack.setOnClickListener(v -> finish());

        btnUpdateProfile.setOnClickListener(v -> updateProfile());

        switchDarkMode.setOnCheckedChangeListener((buttonView, isChecked) -> {
            prefs.edit().putBoolean("dark_mode", isChecked).apply();
            if (isChecked) {
                AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES);
            } else {
                AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO);
            }
        });

        btnDeleteAccount.setOnClickListener(v -> showDeleteConfirmationDialog());
    }

    private void updateProfile() {
        FirebaseUser user = mAuth.getCurrentUser();
        if (user == null) return;

        String name = etName.getText().toString().trim();
        String rashi = etRashi.getText().toString().trim();

        if (name.isEmpty()) {
            etName.setError("Name required");
            return;
        }

        Map<String, Object> updates = new HashMap<>();
        updates.put("full_name", name);
        updates.put("rashi", rashi.isEmpty() ? "Mesh (Aries)" : rashi);

        mDatabase.child(user.getUid()).updateChildren(updates).addOnCompleteListener(task -> {
            if (task.isSuccessful()) {
                Toast.makeText(ProfileActivity.this, "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!", Toast.LENGTH_SHORT).show();
                finish();
            } else {
                Toast.makeText(ProfileActivity.this, "त्रुटि: " + task.getException().getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showDeleteConfirmationDialog() {
        new AlertDialog.Builder(this)
                .setTitle("खाता डिलीट करें?")
                .setMessage("क्या आप निश्चित रूप से अपना खाता और सभी डेटा हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।")
                .setPositiveButton("हाँ, डिलीट करें", (dialog, which) -> deleteAccount())
                .setNegativeButton("रद्द करें", null)
                .show();
    }

    private void deleteAccount() {
        FirebaseUser user = mAuth.getCurrentUser();
        if (user != null) {
            String uid = user.getUid();
            mDatabase.child(uid).removeValue().addOnCompleteListener(dbTask -> {
                user.delete().addOnCompleteListener(authTask -> {
                    if (authTask.isSuccessful()) {
                        Toast.makeText(ProfileActivity.this, "आपका खाता सफलतापूर्वक हटा दिया गया है।", Toast.LENGTH_LONG).show();
                        Intent intent = new Intent(ProfileActivity.this, LoginActivity.class);
                        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                        startActivity(intent);
                        finish();
                    } else {
                        Toast.makeText(ProfileActivity.this, "Error deleting auth account: " + authTask.getException().getMessage(), Toast.LENGTH_LONG).show();
                    }
                });
            });
        }
    }
}
