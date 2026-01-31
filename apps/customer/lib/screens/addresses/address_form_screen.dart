import 'package:flutter/material.dart';
import '../../core/services/address_service.dart';
import '../../models/address.dart';
import '../../constants.dart';

// Indian states list
const List<String> indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

class AddressFormScreen extends StatefulWidget {
  final Address? address;

  const AddressFormScreen({Key? key, this.address}) : super(key: key);

  @override
  State<AddressFormScreen> createState() => _AddressFormScreenState();
}

class _AddressFormScreenState extends State<AddressFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  bool _isCheckingDelivery = false;
  DeliveryZone? _deliveryZone;
  bool _deliveryChecked = false;

  late TextEditingController _labelController;
  late TextEditingController _addressLine1Controller;
  late TextEditingController _addressLine2Controller;
  late TextEditingController _cityController;
  late TextEditingController _postalCodeController;
  late TextEditingController _instructionsController;
  String? _selectedState;
  bool _isDefault = false;

  final List<String> _labelOptions = ['Home', 'Work', 'Other'];
  String _selectedLabel = 'Home';

  @override
  void initState() {
    super.initState();
    final addr = widget.address;
    _labelController = TextEditingController(text: addr?.label ?? 'Home');
    _addressLine1Controller = TextEditingController(text: addr?.addressLine1 ?? '');
    _addressLine2Controller = TextEditingController(text: addr?.addressLine2 ?? '');
    _cityController = TextEditingController(text: addr?.city ?? '');
    _postalCodeController = TextEditingController(text: addr?.postalCode ?? '');
    _instructionsController = TextEditingController(text: addr?.instructions ?? '');
    _selectedState = addr?.state;
    _isDefault = addr?.isDefault ?? false;
    _deliveryZone = addr?.deliveryZone;

    if (addr != null) {
      _selectedLabel = _labelOptions.contains(addr.label) ? addr.label : 'Other';
      if (_selectedLabel == 'Other') {
        _labelController.text = addr.label;
      }
      _deliveryChecked = true;
    }
  }

  @override
  void dispose() {
    _labelController.dispose();
    _addressLine1Controller.dispose();
    _addressLine2Controller.dispose();
    _cityController.dispose();
    _postalCodeController.dispose();
    _instructionsController.dispose();
    super.dispose();
  }

  Future<void> _checkDelivery() async {
    final postalCode = _postalCodeController.text.trim();
    if (postalCode.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid 6-digit PIN code')),
      );
      return;
    }

    setState(() => _isCheckingDelivery = true);

    try {
      final zone = await AddressService.checkDeliverability(postalCode);
      setState(() {
        _deliveryZone = zone;
        _deliveryChecked = true;
      });

      if (zone == null && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Sorry, we do not deliver to this area yet'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error checking delivery: $e')),
        );
      }
    } finally {
      setState(() => _isCheckingDelivery = false);
    }
  }

  Future<void> _saveAddress() async {
    if (!_formKey.currentState!.validate()) return;

    if (!_deliveryChecked) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please check delivery availability first')),
      );
      return;
    }

    if (_deliveryZone == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Delivery is not available to this area'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final label = _selectedLabel == 'Other'
          ? _labelController.text.trim()
          : _selectedLabel;

      final address = Address(
        id: widget.address?.id ?? '',
        label: label,
        addressLine1: _addressLine1Controller.text.trim(),
        addressLine2: _addressLine2Controller.text.trim().isEmpty
            ? null
            : _addressLine2Controller.text.trim(),
        city: _cityController.text.trim(),
        state: _selectedState,
        postalCode: _postalCodeController.text.trim(),
        country: 'India',
        instructions: _instructionsController.text.trim().isEmpty
            ? null
            : _instructionsController.text.trim(),
        isDefault: _isDefault,
        deliveryZone: _deliveryZone,
      );

      if (widget.address != null) {
        await AddressService.updateAddress(widget.address!.id, address);
      } else {
        await AddressService.createAddress(address);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(widget.address != null
                ? 'Address updated successfully'
                : 'Address added successfully'),
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.address != null ? 'Edit Address' : 'Add Address'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(defaultPadding),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Label selection
              const Text(
                'Address Label',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 10,
                children: _labelOptions.map((label) {
                  final isSelected = _selectedLabel == label;
                  return ChoiceChip(
                    label: Text(label),
                    selected: isSelected,
                    selectedColor: primaryColor,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : titleColor,
                    ),
                    onSelected: (selected) {
                      if (selected) {
                        setState(() => _selectedLabel = label);
                      }
                    },
                  );
                }).toList(),
              ),
              if (_selectedLabel == 'Other') ...[
                const SizedBox(height: 12),
                TextFormField(
                  controller: _labelController,
                  decoration: const InputDecoration(
                    labelText: 'Custom Label',
                    hintText: 'e.g., Mom\'s House',
                  ),
                  validator: (value) {
                    if (_selectedLabel == 'Other' &&
                        (value == null || value.trim().isEmpty)) {
                      return 'Please enter a label';
                    }
                    return null;
                  },
                ),
              ],
              const SizedBox(height: 20),

              // Address Line 1
              TextFormField(
                controller: _addressLine1Controller,
                decoration: const InputDecoration(
                  labelText: 'Address Line 1 *',
                  hintText: 'House/Flat No., Building Name',
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter address';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Address Line 2
              TextFormField(
                controller: _addressLine2Controller,
                decoration: const InputDecoration(
                  labelText: 'Address Line 2',
                  hintText: 'Street, Area, Landmark',
                ),
              ),
              const SizedBox(height: 16),

              // City
              TextFormField(
                controller: _cityController,
                decoration: const InputDecoration(
                  labelText: 'City *',
                  hintText: 'Enter city name',
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter city';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // State dropdown
              DropdownButtonFormField<String>(
                value: _selectedState,
                decoration: const InputDecoration(
                  labelText: 'State *',
                ),
                items: indianStates.map((state) {
                  return DropdownMenuItem(value: state, child: Text(state));
                }).toList(),
                onChanged: (value) => setState(() => _selectedState = value),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please select state';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // PIN Code with delivery check
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    flex: 2,
                    child: TextFormField(
                      controller: _postalCodeController,
                      keyboardType: TextInputType.number,
                      maxLength: 6,
                      decoration: const InputDecoration(
                        labelText: 'PIN Code *',
                        hintText: '6-digit PIN',
                        counterText: '',
                      ),
                      onChanged: (value) {
                        if (_deliveryChecked) {
                          setState(() {
                            _deliveryChecked = false;
                            _deliveryZone = null;
                          });
                        }
                      },
                      validator: (value) {
                        if (value == null || value.trim().length != 6) {
                          return 'Enter valid 6-digit PIN';
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: ElevatedButton(
                        onPressed: _isCheckingDelivery ? null : _checkDelivery,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryColor,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: _isCheckingDelivery
                            ? const SizedBox(
                                height: 16,
                                width: 16,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : const Text('Check'),
                      ),
                    ),
                  ),
                ],
              ),

              // Delivery status
              if (_deliveryChecked) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: _deliveryZone != null ? Colors.green[50] : Colors.red[50],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: _deliveryZone != null ? Colors.green[200]! : Colors.red[200]!,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _deliveryZone != null ? Icons.check_circle : Icons.cancel,
                        color: _deliveryZone != null ? Colors.green : Colors.red,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _deliveryZone != null
                                  ? 'Delivery Available!'
                                  : 'Delivery Not Available',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: _deliveryZone != null
                                    ? Colors.green[700]
                                    : Colors.red[700],
                              ),
                            ),
                            if (_deliveryZone != null) ...[
                              Text(
                                '${_deliveryZone!.name} - ₹${_deliveryZone!.deliveryFee.toStringAsFixed(2)} delivery fee',
                                style: TextStyle(
                                  color: Colors.green[700],
                                  fontSize: 12,
                                ),
                              ),
                              if (_deliveryZone!.minimumOrder != null)
                                Text(
                                  'Min. order: ₹${_deliveryZone!.minimumOrder!.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    color: Colors.green[700],
                                    fontSize: 12,
                                  ),
                                ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 16),

              // Delivery instructions
              TextFormField(
                controller: _instructionsController,
                maxLines: 2,
                decoration: const InputDecoration(
                  labelText: 'Delivery Instructions (Optional)',
                  hintText: 'e.g., Ring doorbell twice, call on arrival',
                ),
              ),
              const SizedBox(height: 16),

              // Default address switch
              SwitchListTile(
                value: _isDefault,
                onChanged: (value) => setState(() => _isDefault = value),
                title: const Text('Set as default address'),
                contentPadding: EdgeInsets.zero,
                activeColor: primaryColor,
              ),
              const SizedBox(height: 24),

              // Save button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _saveAddress,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : Text(
                          widget.address != null ? 'Update Address' : 'Save Address',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
