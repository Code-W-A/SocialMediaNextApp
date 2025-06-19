"use server";

// Mock file upload functions

export const uploadFile = async (file, folder) => {
  try {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock response similar to Cloudinary
    const mockResponse = {
      public_id: `mock_${folder.replace(/\//g, '_')}_${Date.now()}`,
      secure_url: file, // In mock, we'll just return the data URL as is
      url: file,
      format: 'auto',
      resource_type: 'auto',
    };
    
    console.log('Mock file uploaded:', mockResponse);
    return mockResponse;
  } catch (error) {
    console.error('Mock upload error:', error);
    throw error;
  }
};

export const deleteFile = async (publicId) => {
  try {
    // Simulate delete delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Mock file deleted:', publicId);
    return { result: 'ok' };
  } catch (error) {
    console.error('Mock delete error:', error);
    throw error;
  }
};
