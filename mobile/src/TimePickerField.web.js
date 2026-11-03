import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { colors, Icon } from "./ui";

export default function TimePickerField({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  return <View style={{ marginBottom: 16 }}>
    <Text style={{ color: colors.muted, marginBottom: 8, fontWeight: "700" }}>{label}</Text>
    <Pressable onPress={() => setOpen(current => !current)} accessibilityRole="button" style={{ minHeight: 51, borderWidth: 1, borderColor: "#484035", borderRadius: 14, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}><Text style={{ color: value ? colors.text : colors.muted }}>{value || "Choisir une heure"}</Text><Icon name="time-outline" /></Pressable>
    {open && <ScrollView style={{ maxHeight: 180, marginTop: 8 }} nestedScrollEnabled>{Array.from({ length: 48 }, (_, index) => `${String(Math.floor(index / 2)).padStart(2, "0")}:${index % 2 ? "30" : "00"}`).map(time => <Pressable key={time} onPress={() => { onChange(time); setOpen(false); }} style={{ padding: 12 }}><Text style={{ color: colors.text }}>{time}</Text></Pressable>)}</ScrollView>}
  </View>;
}
