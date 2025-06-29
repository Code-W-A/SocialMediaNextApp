"use client";

import React from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLanguage } from '@/lib/i18n';

const LanguageSwitcher = ({ style = {}, size = 'default', className = '', mobileOnly = false }) => {
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
        minWidth: mobileOnly ? 'auto' : 120,
        ...style 
      }}
      size={size}
      suffixIcon={mobileOnly ? null : <GlobalOutlined />}
      className={className}
      showArrow={!mobileOnly}
      variant="outlined"
    >
      {languages.map(lang => (
        <Select.Option key={lang.code} value={lang.code}>
          <span style={{ 
            marginRight: mobileOnly ? '0' : '8px',
            fontSize: mobileOnly ? '18px' : '14px'
          }}>
            {lang.flag}
          </span>
          {!mobileOnly && lang.name}
        </Select.Option>
      ))}
    </Select>
  );
};

export default LanguageSwitcher; 