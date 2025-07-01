"use client";

import React from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLanguage } from '@/lib/i18n';

const LanguageSwitcher = ({ style = {}, size = 'default', mobileMode = false }) => {
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { code: 'ro', name: 'Română', flag: '🇷🇴' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <Select
      value={language}
      onChange={changeLanguage}
      style={{ 
        minWidth: mobileMode ? 50 : 120,
        ...style 
      }}
      size={size}
      suffixIcon={mobileMode ? null : <GlobalOutlined />}
      className={mobileMode ? 'mobile-language-switcher' : ''}
    >
      {languages.map(lang => (
        <Select.Option key={lang.code} value={lang.code}>
          <span style={{ marginRight: mobileMode ? 0 : '8px' }}>{lang.flag}</span>
          {!mobileMode && lang.name}
        </Select.Option>
      ))}
    </Select>
  );
};

export default LanguageSwitcher; 