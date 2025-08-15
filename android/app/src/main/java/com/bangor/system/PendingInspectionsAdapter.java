package com.bangor.system;

import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class PendingInspectionsAdapter extends RecyclerView.Adapter<PendingInspectionsAdapter.ViewHolder> {

    public static class ViewHolder extends RecyclerView.ViewHolder {
        public ViewHolder(View itemView) {
            super(itemView);
        }
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        return null; // Placeholder
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        // Placeholder
    }

    @Override
    public int getItemCount() {
        return 0; // Placeholder
    }
}
