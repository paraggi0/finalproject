package com.bangor.system.ui.production;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.bangor.system.MesinOutputActivity;
import com.bangor.system.R;
import com.bangor.system.SecondProsesActivity;
import com.bangor.system.TransferQCActivity;
import com.google.android.material.card.MaterialCardView;

public class ProductionFragment extends Fragment {

    private MaterialCardView cardTransferQC, cardMesinOutput, cardSecondProses, cardQRScan;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_production, container, false);

        initViews(root);
        setupClickListeners();

        return root;
    }

    private void initViews(View root) {
        cardTransferQC = root.findViewById(R.id.cardTransferQC);
        cardMesinOutput = root.findViewById(R.id.cardMesinOutput);
        cardSecondProses = root.findViewById(R.id.cardSecondProses);
        cardQRScan = root.findViewById(R.id.cardQRScan);
    }

    private void setupClickListeners() {
        cardTransferQC.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(getActivity(), TransferQCActivity.class);
                startActivity(intent);
            }
        });

        cardMesinOutput.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(getActivity(), MesinOutputActivity.class);
                startActivity(intent);
            }
        });

        cardSecondProses.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(getActivity(), SecondProsesActivity.class);
                startActivity(intent);
            }
        });

        cardQRScan.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // TODO: Implement QR Scan Status Activity
                // Intent intent = new Intent(getActivity(), QRScanStatusActivity.class);
                // startActivity(intent);
            }
        });
    }
}
