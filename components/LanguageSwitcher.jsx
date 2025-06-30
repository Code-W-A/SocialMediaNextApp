"use client";

import React from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLanguage } from '@/lib/i18n';

const LanguageSwitcher = ({ style = {}, size = 'default' }) => {
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { code: 'ro', name: 'Română', flag: '🇷🇴' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  return (
    <Select
      value={language}
      onChange={changeLanguage}
      style={{ 
        minWidth: 120,
        ...style 
      }}
      size={size}
      suffixIcon={<GlobalOutlined />}
    >
      {languages.map(lang => (
        <Select.Option key={lang.code} value={lang.code}>
          <span style={{ marginRight: '8px' }}>{lang.flag}</span>
          {lang.name}
        </Select.Option>
      ))}
    </Select>
  );
};

export default LanguageSwitcher; 