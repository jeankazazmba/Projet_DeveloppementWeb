import React from "react";
import { Image } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

// Brand paths: https://github.com/simple-icons/simple-icons (CC0).
// Airtel Money and M-Pesa artwork: https://www.pawapay.io/markets
const paths = {"visa":"M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z","bitcoin":"M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z","ethereum":"M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z","orange":"M0 0h24v24H0V0Zm3.43 20.572h17.143v-3.429H3.43v3.429Z"};

export default function PaymentBrandLogo({ brand, size = 34 }) {
  if (brand === "airtel" || brand === "mpesa") {
    return (
      <Image
        source={brand === "airtel" ? require("../assets/payment/airtel-money.png") : require("../assets/payment/mpesa.png")}
        resizeMode="contain"
        style={{ width: size * 1.5, height: size }}
        accessibilityLabel={brand === "airtel" ? "Airtel Money" : "M-Pesa"}
      />
    );
  }
  if (brand === "mastercard") {
    return (
      <Svg width={size} height={size} viewBox="0 0 48 32" accessibilityLabel="Mastercard">
        <Circle cx="18" cy="16" r="14" fill="#EB001B" />
        <Circle cx="30" cy="16" r="14" fill="#F79E1B" />
        <Path d="M24 5.8C20.5 8.3 18.2 12 18.2 16s2.3 7.7 5.8 10.2c3.5-2.5 5.8-6.2 5.8-10.2S27.5 8.3 24 5.8Z" fill="#FF5F00" />
      </Svg>
    );
  }
  const fills = { visa: "#1434CB", bitcoin: "#F7931A", ethereum: "#627EEA", orange: "#FF7900" };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel={brand}>
      <Path d={paths[brand]} fill={fills[brand]} />
    </Svg>
  );
}
