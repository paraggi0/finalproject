package com.bangor;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;

import androidx.appcompat.app.AppCompatActivity;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.navigation.ui.AppBarConfiguration;
import androidx.navigation.ui.NavigationUI;

import com.google.android.material.navigation.NavigationView;
import com.google.android.material.snackbar.Snackbar;

public class MainActivity extends AppCompatActivity {

    private AppBarConfiguration mAppBarConfiguration;
    private SharedPreferences sharedPreferences;
    private String userDepartment;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        sharedPreferences = getSharedPreferences("UserSession", MODE_PRIVATE);

        // Check if user is logged in
        if (!sharedPreferences.getBoolean("isLoggedIn", false)) {
            redirectToLogin();
            return;
        }

        // Get user department from intent or shared preferences
        userDepartment = getIntent().getStringExtra("department");
        if (userDepartment == null) {
            userDepartment = sharedPreferences.getString("department", "");
        }

        setupNavigation();
        showDepartmentSpecificContent();
    }

    private void redirectToLogin() {
        Intent intent = new Intent(this, LoginActivity.class);
        startActivity(intent);
        finish();
    }

    private void setupNavigation() {
        setSupportActionBar(findViewById(R.id.toolbar));

        DrawerLayout drawer = findViewById(R.id.drawer_layout);
        NavigationView navigationView = findViewById(R.id.nav_view);

        // Configure navigation based on department
        mAppBarConfiguration = new AppBarConfiguration.Builder(
                getNavigationMenuForDepartment())
                .setOpenableLayout(drawer)
                .build();

        NavController navController = Navigation.findNavController(this, R.id.nav_host_fragment_content_main);
        NavigationUI.setupActionBarWithNavController(this, navController, mAppBarConfiguration);
        NavigationUI.setupWithNavController(navigationView, navController);
    }

    private int getNavigationMenuForDepartment() {
        switch (userDepartment) {
            case "PPIC (Production Planning)":
            case "Produksi (Production)":
                return R.id.nav_production;
            case "QC (Quality Control)":
                return R.id.nav_qc;
            case "Warehouse":
                return R.id.nav_warehouse;
            default:
                return R.id.nav_production;
        }
    }

    private void showDepartmentSpecificContent() {
        String welcomeMessage = "Selamat datang di " + userDepartment;

        // Navigate to appropriate fragment based on department
        NavController navController = Navigation.findNavController(this, R.id.nav_host_fragment_content_main);

        switch (userDepartment) {
            case "PPIC (Production Planning)":
            case "Produksi (Production)":
                // Production fragment will be shown by default
                break;
            case "QC (Quality Control)":
                // TODO: Navigate to QC fragment
                break;
            case "Warehouse":
                // TODO: Navigate to Warehouse fragment
                break;
        }

        // Show welcome message
        Snackbar.make(findViewById(android.R.id.content), welcomeMessage, Snackbar.LENGTH_LONG).show();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();

        if (id == R.id.action_logout) {
            logout();
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    private void logout() {
        // Clear user session
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.clear();
        editor.apply();

        // Redirect to login
        redirectToLogin();
    }

    @Override
    public boolean onSupportNavigateUp() {
        NavController navController = Navigation.findNavController(this, R.id.nav_host_fragment_content_main);
        return NavigationUI.navigateUp(navController, mAppBarConfiguration)
                || super.onSupportNavigateUp();
    }
}
