import { useState, useCallback } from 'react';

type Rules = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
  email?: boolean;
  phone?: boolean;
};

type Errors = Record<string, string>;

export function useFormValidation<T extends Record<string, string>>() {
  const [errors, setErrors] = useState<Errors>({});

  const validate = useCallback((name: string, value: string, rules: Rules): boolean => {
    let error = '';

    if (rules.required && !value.trim()) {
      error = 'This field is required';
    } else if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Enter a valid email address';
    } else if (rules.phone && !/^[+0-9]{10,15}$/.test(value.replace(/\s/g, ''))) {
      error = 'Enter a valid phone number';
    } else if (rules.minLength && value.length < rules.minLength) {
      error = `Minimum ${rules.minLength} characters required`;
    } else if (rules.maxLength && value.length > rules.maxLength) {
      error = `Maximum ${rules.maxLength} characters allowed`;
    } else if (rules.pattern && !rules.pattern.test(value)) {
      error = rules.patternMessage || 'Invalid format';
    }

    setErrors(prev => {
      if (!error) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return { ...prev, [name]: error };
    });

    return !error;
  }, []);

  const validateAll = useCallback((fields: Record<string, { value: string; rules: Rules }>): boolean => {
    let allValid = true;
    for (const [name, { value, rules }] of Object.entries(fields)) {
      if (!validate(name, value, rules)) allValid = false;
    }
    return allValid;
  }, [validate]);

  const clearError = useCallback((name: string) => {
    setErrors(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setErrors({}), []);

  return { errors, validate, validateAll, clearError, clearAll };
}
