package com.project.karmphal;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class LeaderboardAdapter extends RecyclerView.Adapter<LeaderboardAdapter.ViewHolder> {

    private final List<LeaderboardUser> userList;

    public LeaderboardAdapter(List<LeaderboardUser> userList) {
        this.userList = userList;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_leaderboard, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        LeaderboardUser user = userList.get(position);
        holder.tvRank.setText("#" + (position + 1));
        holder.tvName.setText(user.full_name != null ? user.full_name : "भक्त");
        holder.tvPoints.setText(user.sadhana_points + " 🕉️");
    }

    @Override
    public int getItemCount() {
        return userList.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvRank, tvName, tvPoints;
        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvRank = itemView.findViewById(R.id.tvRank);
            tvName = itemView.findViewById(R.id.tvName);
            tvPoints = itemView.findViewById(R.id.tvPoints);
        }
    }
}
