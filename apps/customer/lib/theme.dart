import 'package:flutter/material.dart';

import 'constants.dart';

ThemeData buildThemeData() {
  return ThemeData(
    primaryColor: primaryColor,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primaryColor,
      primary: primaryColor,
    ),
    scaffoldBackgroundColor: Colors.white,
    fontFamily: "SF Pro Text",
    appBarTheme: const AppBarTheme(
      color: Colors.white,
      elevation: 0,
      centerTitle: true,
      iconTheme: IconThemeData(color: Colors.black),
      titleTextStyle: TextStyle(
        color: titleColor,
        fontSize: 18,
        fontWeight: FontWeight.w600,
        fontFamily: "SF Pro Text",
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        minimumSize: const Size(double.infinity, 50),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        textStyle: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),
    inputDecorationTheme: inputDecorationTheme,
    buttonTheme: buttonThemeData,
    visualDensity: VisualDensity.adaptivePlatformDensity,
  );
}

final InputDecorationTheme inputDecorationTheme = InputDecorationTheme(
  fillColor: inputColor,
  filled: true,
  // hintStyle: Theme.of(context).textTheme.bodyMedium,
  contentPadding: const EdgeInsets.all(defaultPadding),
  border: kDefaultOutlineInputBorder,
  enabledBorder: kDefaultOutlineInputBorder,
  focusedBorder: kDefaultOutlineInputBorder.copyWith(
      borderSide: BorderSide(
    color: primaryColor.withOpacity(0.5),
  )),
  errorBorder: kDefaultOutlineInputBorder.copyWith(
    borderSide: kErrorBorderSide,
  ),
  focusedErrorBorder: kDefaultOutlineInputBorder.copyWith(
    borderSide: kErrorBorderSide,
  ),
);

const ButtonThemeData buttonThemeData = ButtonThemeData(
  shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.all(Radius.circular(8))),
);
