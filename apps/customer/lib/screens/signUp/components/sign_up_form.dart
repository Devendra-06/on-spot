import 'package:flutter/material.dart';
import 'package:foodly_ui/screens/phoneLogin/phone_login_screen.dart';
import 'package:foodly_ui/screens/auth/auth_service.dart';

import '../../../constants.dart';

class SignUpForm extends StatefulWidget {
  const SignUpForm({super.key});

  @override
  _SignUpFormState createState() => _SignUpFormState();
}

class _SignUpFormState extends State<SignUpForm> {
  final _formKey = GlobalKey<FormState>();
  bool _obscureText = true;
  String? _fullName, _email, _password;
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          // Full Name Field
          TextFormField(
            validator: requiredValidator,
            onSaved: (value) => _fullName = value,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(hintText: "Full Name"),
          ),
          const SizedBox(height: defaultPadding),

          // Email Field
          TextFormField(
            validator: emailValidator,
            onSaved: (value) => _email = value,
            textInputAction: TextInputAction.next,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(hintText: "Email Address"),
          ),
          const SizedBox(height: defaultPadding),

          // Password Field
          TextFormField(
            obscureText: _obscureText,
            validator: passwordValidator,
            textInputAction: TextInputAction.next,
            onChanged: (value) => _password = value,
            onSaved: (value) => _password = value,
            decoration: InputDecoration(
              hintText: "Password",
              suffixIcon: GestureDetector(
                onTap: () {
                  setState(() {
                    _obscureText = !_obscureText;
                  });
                },
                child: _obscureText
                    ? const Icon(Icons.visibility_off, color: bodyTextColor)
                    : const Icon(Icons.visibility, color: bodyTextColor),
              ),
            ),
          ),
          const SizedBox(height: defaultPadding),

          // Sign Up Button
          ElevatedButton(
            onPressed: _isLoading
                ? null
                : () async {
                    if (_formKey.currentState!.validate()) {
                      _formKey.currentState!.save();
                      setState(() => _isLoading = true);

                      try {
                        // Split name
                        final parts = _fullName!.trim().split(' ');
                        final firstName = parts[0];
                        final lastName = parts.length > 1 ? parts.sublist(1).join(' ') : 'Doe';

                        await AuthService.register(_email!, _password!, firstName, lastName);
                        
                        if (mounted) {
                           ScaffoldMessenger.of(context).showSnackBar(
                             const SnackBar(content: Text("Account created! Please sign in.")),
                           );
                           Navigator.pop(context); // Go back to Sign In
                        }
                      } catch (e) {
                         ScaffoldMessenger.of(context).showSnackBar(
                           SnackBar(content: Text(e.toString())),
                         );
                      } finally {
                         if (mounted) setState(() => _isLoading = false);
                      }
                    }
                  },
            child: _isLoading ? const CircularProgressIndicator(color: Colors.white) : const Text("Sign Up"),
          ),
        ],
      ),
    );
  }
}
