import streamlit as st
import pandas as pd
from src.utils.tracker import tracker

st.set_page_config(page_title="Token Usage", page_icon="💰")

st.title("💰 Token Usage & Cost Monitoring")

if not tracker.session_stats:
    st.info("No usage data available yet. Run a battle first!")
else:
    # Aggregate Data
    data = []
    for model, stats in tracker.session_stats.items():
        data.append({
            "Model": model,
            "Prompt Tokens": stats.prompt_tokens,
            "Completion Tokens": stats.completion_tokens,
            "Total Tokens": stats.total_tokens,
            "Cost ($)": stats.estimated_cost
        })
    
    df = pd.DataFrame(data)
    
    # Metrics
    total_cost = df["Cost ($)"].sum()
    total_tokens = df["Total Tokens"].sum()
    
    col1, col2 = st.columns(2)
    col1.metric("Total Session Cost", f"${total_cost:.4f}")
    col2.metric("Total Session Tokens", total_tokens)
    
    st.divider()
    
    # Detailed Table
    st.subheader("Usage by Model")
    st.dataframe(df, use_container_width=True)
    
    # Charts
    st.subheader("Cost Distribution")
    st.bar_chart(df.set_index("Model")["Cost ($)"])
