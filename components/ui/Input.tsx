import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../lib/constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  secureTextEntry,
  onFocus,
  onBlur,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPassword = secureTextEntry;
  const showPasswordToggle = isPassword;
  const actualSecureTextEntry = isPassword ? !isPasswordVisible : false;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
          props.multiline ? styles.inputContainerMultiline : null,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? COLORS.error : isFocused ? COLORS.accent : COLORS.textMuted}
            style={[styles.leftIcon, props.multiline ? { marginTop: 4 } : null]}
          />
        )}
        
        <TextInput
          style={[styles.textInput, props.multiline ? styles.textInputMultiline : null, style]}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={actualSecureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
          {...props}
        />
        
        {showPasswordToggle ? (
          <TouchableOpacity
            style={styles.rightIconButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            style={styles.rightIconButton}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            activeOpacity={0.7}
          >
            <Ionicons name={rightIcon} size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
  },
  inputFocused: {
    borderColor: COLORS.accent,
    borderWidth: 1.5,
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  textInput: {
    flex: 1,
    height: '100%',
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
    paddingVertical: 0,
  },
  inputContainerMultiline: {
    height: 'auto',
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
  },
  textInputMultiline: {
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  rightIconButton: {
    padding: SPACING.xs,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});
export default Input;
