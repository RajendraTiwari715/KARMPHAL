package com.project.karmphal;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.FirebaseDatabase;

import java.util.HashMap;
import java.util.Map;

public class LoginActivity extends AppCompatActivity {

    private FirebaseAuth mAuth;
    private TextInputEditText etEmail, etPassword, etName;
    private AutoCompleteTextView etRashi;
    private TextInputLayout layoutName, layoutRashi, layoutPassword;
    private TextView tvTitle, tvToggleMode, tvForgotPassword;
    private MaterialButton btnSubmit;
    private ProgressBar progressBar;

    private boolean isLoginMode = true;
    private boolean isForgotPasswordMode = false;

    private final String[] rashis = {"Mesh (Aries)", "Vrishabha (Taurus)", "Mithun (Gemini)", 
                                     "Karka (Cancer)", "Simha (Leo)", "Kanya (Virgo)", 
                                     "Tula (Libra)", "Vrishchika (Scorpio)", "Dhanu (Sagittarius)", 
                                     "Makar (Capricorn)", "Kumbha (Aquarius)", "Meen (Pisces)"};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        mAuth = FirebaseAuth.getInstance();
        
        // Check if user is already logged in
        if (mAuth.getCurrentUser() != null) {
            startMainActivity();
        }

        initViews();
        setupListeners();
    }

    private void initViews() {
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        etName = findViewById(R.id.etName);
        etRashi = findViewById(R.id.etRashi);
        
        layoutName = findViewById(R.id.layoutName);
        layoutRashi = findViewById(R.id.layoutRashi);
        layoutPassword = findViewById(R.id.layoutPassword);
        
        tvTitle = findViewById(R.id.tvTitle);
        tvToggleMode = findViewById(R.id.tvToggleMode);
        tvForgotPassword = findViewById(R.id.tvForgotPassword);
        btnSubmit = findViewById(R.id.btnSubmit);
        progressBar = findViewById(R.id.progressBar);

        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_dropdown_item_1line, rashis);
        etRashi.setAdapter(adapter);
    }

    private void setupListeners() {
        tvToggleMode.setOnClickListener(v -> toggleMode());
        tvForgotPassword.setOnClickListener(v -> toggleForgotPasswordMode());

        btnSubmit.setOnClickListener(v -> {
            String email = etEmail.getText().toString().trim();
            String password = etPassword.getText().toString().trim();
            String name = etName.getText().toString().trim();
            String rashi = etRashi.getText().toString().trim();

            if (email.isEmpty()) {
                etEmail.setError("Email required");
                return;
            }

            progressBar.setVisibility(View.VISIBLE);
            btnSubmit.setEnabled(false);

            if (isForgotPasswordMode) {
                handleForgotPassword(email);
            } else if (isLoginMode) {
                if (password.isEmpty()) {
                    etPassword.setError("Password required");
                    resetUIState();
                    return;
                }
                handleLogin(email, password);
            } else {
                if (password.isEmpty()) {
                    etPassword.setError("Password required");
                    resetUIState();
                    return;
                }
                if (name.isEmpty()) {
                    etName.setError("Name required");
                    resetUIState();
                    return;
                }
                handleRegistration(email, password, name, rashi);
            }
        });
    }

    private void toggleMode() {
        isForgotPasswordMode = false;
        isLoginMode = !isLoginMode;
        
        tvForgotPassword.setVisibility(isLoginMode ? View.VISIBLE : View.GONE);
        layoutPassword.setVisibility(View.VISIBLE);

        if (isLoginMode) {
            tvTitle.setText("लॉगिन करें");
            btnSubmit.setText("लॉगिन");
            tvToggleMode.setText("नया खाता बनाएँ (Register)");
            layoutName.setVisibility(View.GONE);
            layoutRashi.setVisibility(View.GONE);
        } else {
            tvTitle.setText("नया खाता बनाएँ");
            btnSubmit.setText("रजिस्टर");
            tvToggleMode.setText("पहले से खाता है? लॉगिन करें (Login)");
            layoutName.setVisibility(View.VISIBLE);
            layoutRashi.setVisibility(View.VISIBLE);
        }
    }

    private void toggleForgotPasswordMode() {
        isForgotPasswordMode = true;
        isLoginMode = false;
        
        tvTitle.setText("पासवर्ड रीसेट करें");
        btnSubmit.setText("रीसेट लिंक भेजें");
        tvToggleMode.setText("वापस लॉगिन पर जाएँ (Back to Login)");
        
        layoutPassword.setVisibility(View.GONE);
        layoutName.setVisibility(View.GONE);
        layoutRashi.setVisibility(View.GONE);
        tvForgotPassword.setVisibility(View.GONE);
    }

    private void handleLogin(String email, String password) {
        mAuth.signInWithEmailAndPassword(email, password)
            .addOnCompleteListener(this, task -> {
                if (task.isSuccessful()) {
                    startMainActivity();
                } else {
                    resetUIState();
                    Toast.makeText(LoginActivity.this, "Error: " + task.getException().getMessage(), Toast.LENGTH_LONG).show();
                }
            });
    }

    private void handleRegistration(String email, String password, String name, String rashi) {
        mAuth.createUserWithEmailAndPassword(email, password)
            .addOnCompleteListener(this, task -> {
                if (task.isSuccessful()) {
                    FirebaseUser user = mAuth.getCurrentUser();
                    if (user != null) {
                        saveUserToDatabase(user.getUid(), email, name, rashi);
                    }
                } else {
                    resetUIState();
                    Toast.makeText(LoginActivity.this, "Error: " + task.getException().getMessage(), Toast.LENGTH_LONG).show();
                }
            });
    }

    private void handleForgotPassword(String email) {
        mAuth.sendPasswordResetEmail(email)
            .addOnCompleteListener(task -> {
                resetUIState();
                if (task.isSuccessful()) {
                    Toast.makeText(LoginActivity.this, "पासवर्ड रीसेट लिंक आपके ईमेल पर भेज दिया गया है। (Check your email)", Toast.LENGTH_LONG).show();
                    toggleMode(); // Go back to login
                } else {
                    Toast.makeText(LoginActivity.this, "Error: " + task.getException().getMessage(), Toast.LENGTH_LONG).show();
                }
            });
    }

    private void saveUserToDatabase(String uid, String email, String name, String rashi) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", uid);
        userMap.put("email", email);
        userMap.put("full_name", name);
        userMap.put("rashi", rashi.isEmpty() ? "Mesh (Aries)" : rashi);
        userMap.put("sadhana_points", 0);
        userMap.put("created_at", System.currentTimeMillis());

        FirebaseDatabase.getInstance().getReference("users").child(uid).setValue(userMap)
            .addOnCompleteListener(task -> {
                if (task.isSuccessful()) {
                    startMainActivity();
                } else {
                    resetUIState();
                    Toast.makeText(LoginActivity.this, "Database Error: " + task.getException().getMessage(), Toast.LENGTH_LONG).show();
                }
            });
    }

    private void resetUIState() {
        progressBar.setVisibility(View.GONE);
        btnSubmit.setEnabled(true);
    }

    private void startMainActivity() {
        Intent intent = new Intent(this, MainActivity.class);
        startActivity(intent);
        finish();
    }
}
