"use client";
import React from 'react';
import { Select } from 'antd';
import { useLanguage } from '@/lib/i18n';
import Iconify from './Iconify';

const { Option } = Select;

const LanguageSelector = ({ 
  size = "middle", 
  style = {}, 
  showIcon = true,
  showText = true,
  placement = "bottomRight"
}) => {
  const { language, changeLanguage, t } = useLanguage();

  const languages = [
    { 
      code: 'ro', 
      name: t('onboarding.romanian'),
      flag: '🇷🇴' 
    },
    { 
      code: 'en', 
      name: t('onboarding.english'),
      flag: '🇺🇸' 
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <Select
      value={language}
      onChange={changeLanguage}
      size={size}
      style={{ 
        minWidth: showText ? '140px' : '50px', 
        ...style 
      }}
      placement={placement}
      suffixIcon={showIcon && <Iconify icon="eva:globe-2-fill" width="16px" />}
      optionLabelProp={showText ? "label" : "value"}
    >
      {languages.map(lang => (
        <Option 
          key={lang.code} 
          value={lang.code}
          label={showText ? `${lang.flag} ${lang.name}` : lang.flag}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </div>
        </Option>
      ))}
    </Select>
  );
};

export default LanguageSelector; 