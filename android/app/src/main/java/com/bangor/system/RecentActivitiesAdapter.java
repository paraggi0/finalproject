
package com.bangor.system;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.bangor.system.R;
import java.util.List;

// Placeholder model class for recent activity
class ActivityItem {
    private String description;

    public ActivityItem(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

public class RecentActivitiesAdapter extends RecyclerView.Adapter<RecentActivitiesAdapter.ViewHolder> {

    private List<ActivityItem> activityItems;

    // Constructor to receive the data list
    public RecentActivitiesAdapter(List<ActivityItem> activityItems) {
        this.activityItems = activityItems;
    }

    // ViewHolder class to hold the views for each list item
    public static class ViewHolder extends RecyclerView.ViewHolder {
        public TextView tvActivityDescription;

        public ViewHolder(View itemView) {
            super(itemView);
            // We need a layout for the item, let's assume it has a TextView with this id
            // This will fail if the layout/id doesn't exist, which is our next step.
            tvActivityDescription = itemView.findViewById(android.R.id.text1); 
        }

        public void bind(ActivityItem item) {
            tvActivityDescription.setText(item.getDescription());
        }
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        // We need a layout file for the list item.
        // Let's use a simple built-in Android layout for now.
        View view = LayoutInflater.from(parent.getContext())
                .inflate(android.R.layout.simple_list_item_1, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        ActivityItem item = activityItems.get(position);
        holder.bind(item);
    }

    @Override
    public int getItemCount() {
        return activityItems.size();
    }

    // Method to update data in the adapter
    public void updateData(List<ActivityItem> newActivityItems) {
        this.activityItems.clear();
        this.activityItems.addAll(newActivityItems);
        notifyDataSetChanged();
    }
}
