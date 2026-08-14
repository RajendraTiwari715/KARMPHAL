package com.project.karmphal;

import android.content.Intent;
import android.os.Bundle;
import android.widget.ImageButton;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;

public class MainActivity extends AppCompatActivity {

    private BottomNavigationView bottomNavigationView;
    private ImageButton btnLogout, btnProfile;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize Firebase
        if (FirebaseApp.getApps(this).isEmpty()) {
            FirebaseApp.initializeApp(this);
        }

        // Check Authentication
        if (FirebaseAuth.getInstance().getCurrentUser() == null) {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        setContentView(R.layout.activity_main);
        
        btnProfile = findViewById(R.id.btnProfile);
        btnLogout = findViewById(R.id.btnLogout);

        if (btnProfile != null) {
            btnProfile.setOnClickListener(v -> {
                startActivity(new Intent(MainActivity.this, ProfileActivity.class));
            });
        }

        if (btnLogout != null) {
            btnLogout.setOnClickListener(v -> {
                FirebaseAuth.getInstance().signOut();
                Toast.makeText(MainActivity.this, "सफलतापूर्वक लॉगआउट किया गया", Toast.LENGTH_SHORT).show();
                startActivity(new Intent(MainActivity.this, LoginActivity.class));
                finish();
            });
        }

        bottomNavigationView = findViewById(R.id.bottomNavigationView);
        bottomNavigationView.setOnItemSelectedListener(item -> {
            Fragment selectedFragment = null;
            int itemId = item.getItemId();
            
            if (itemId == R.id.nav_guru) {
                selectedFragment = new GuruFragment();
            } else if (itemId == R.id.nav_gyan) {
                selectedFragment = new GyanFragment();
            } else if (itemId == R.id.nav_sadhana) {
                selectedFragment = new SadhanaFragment();
            } else if (itemId == R.id.nav_jyotish) {
                selectedFragment = new JyotishFragment();
            } else if (itemId == R.id.nav_karm) {
                selectedFragment = new KarmaFragment();
            }

            if (selectedFragment != null) {
                getSupportFragmentManager().beginTransaction()
                    .replace(R.id.fragmentContainer, selectedFragment)
                    .commit();
                return true;
            }
            return false;
        });

        // Set default fragment
        if (savedInstanceState == null) {
            bottomNavigationView.setSelectedItemId(R.id.nav_guru);
        }
    }
}
