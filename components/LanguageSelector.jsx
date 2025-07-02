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

  return (
    <Select
      value={language}
      onChange={changeLanguage}
      size={size}
      style={{ minWidth: '140px', ...style }}
      placement={placement}
      suffixIcon={showIcon && <Iconify icon="eva:globe-2-fill" width="16px" />}
    >
      {languages.map(lang => (
        <Option key={lang.code} value={lang.code}>
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