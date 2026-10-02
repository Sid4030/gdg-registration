import React, { useState } from 'react';
import { sound } from '../utils/sound';

export default function ElasticStringInput({
  label,
  id,
  type = 'text',
  value = '',
  onChange,
  placeholder,
  required = false,
  error,
  hint,
  prefix,
  icon,
  maxLength
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`google-field-container ${error ? 'has-error' : ''} ${isFocused ? 'is-focused' : ''}`}>
      {label && (
        <label htmlFor={id} className="google-field-label">
          <span>
            {label} {required && <span className="req-star">*</span>}
          </span>
          {maxLength && (
            <span className="field-char-badge">
              {value?.length || 0}/{maxLength}
            </span>
          )}
        </label>
      )}

      <div className="google-input-box">
        {prefix && <span className="google-input-prefix">{prefix}</span>}
        {icon && <span className="google-input-icon">{icon}</span>}

        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => {
            onChange(e);
          }}
          onFocus={() => {
            setIsFocused(true);
            sound.playClick();
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
          className="google-native-input"
        />
      </div>

      {hint && !error && <span className="google-field-hint">{hint}</span>}
      {error && <span className="google-field-error">{error}</span>}
    </div>
  );
}
