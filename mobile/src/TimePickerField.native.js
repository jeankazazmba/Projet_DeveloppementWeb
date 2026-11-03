import React, { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { colors, Icon } from "./ui";

const formatTime = (date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

export default function TimePickerField({ label, value, onChange }) {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(() => new Date());
  const open = () => {
    const next = new Date();
    if (value) {
      const [hours, minutes] = value.split(":").map(Number);
      next.setHours(hours, minutes, 0, 0);
    }
    setSelected(next);
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: next,
        mode: "time",
        is24Hour: true,
        onChange: (event, date) => {
          if (event.type === "set" && date) onChange(formatTime(date));
        },
      });
    } else {
      setVisible(true);
    }
  };
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: colors.muted, marginBottom: 8, fontWeight: "700" }}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${value || "choisir une heure"}`}
        onPress={open}
        style={{ minHeight: 51, borderWidth: 1, borderColor: "#484035", borderRadius: 14, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
      >
        <Text style={{ color: value ? colors.text : colors.muted, fontSize: 15 }}>
          {value || "Choisir une heure"}
        </Text>
        <Icon name="time-outline" />
      </Pressable>
      {Platform.OS === "ios" && visible && (
        <View style={{ marginTop: 10 }}>
          <DateTimePicker
            value={selected}
            mode="time"
            display="spinner"
            is24Hour
            locale="fr-FR"
            textColor={colors.text}
            onChange={(_, date) => {
              if (date) {
                setSelected(date);
                onChange(formatTime(date));
              }
            }}
          />
          <Pressable onPress={() => { onChange(formatTime(selected)); setVisible(false); }} style={{ alignSelf: "flex-end", padding: 9 }}>
            <Text style={{ color: colors.gold, fontWeight: "800" }}>Terminer</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
