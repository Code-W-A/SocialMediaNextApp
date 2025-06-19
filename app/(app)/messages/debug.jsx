"use client";
import React, { useState, useEffect } from "react";
import { subscribeToUserConversations } from "@/actions/chat";
import { useUser } from "@/hooks/useFirebaseAuth";

const DebugMessages = () => {
  const { user: currentUser, isLoaded } = useUser();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog(`Component mounted - currentUser: ${currentUser?.id}, isLoaded: ${isLoaded}`);
    
    if (!isLoaded) {
      addLog("Auth not loaded yet, waiting...");
      return;
    }
    
    if (!currentUser?.id) {
      addLog("No current user found");
      setLoading(false);
      return;
    }

    addLog(`Starting subscription for user: ${currentUser.id}`);
    setLoading(true);

    try {
      const unsubscribe = subscribeToUserConversations(
        currentUser.id,
        (updatedConversations) => {
          addLog(`Received ${updatedConversations.length} conversations`);
          setConversations(updatedConversations);
          setLoading(false);
        }
      );

      const timeout = setTimeout(() => {
        addLog("Timeout reached - Firebase didn't respond in 10 seconds");
        setLoading(false);
      }, 10000);

      return () => {
        clearTimeout(timeout);
        if (unsubscribe) unsubscribe();
      };
    } catch (error) {
      addLog(`Error: ${error.message}`);
      setLoading(false);
    }
  }, [currentUser?.id, isLoaded]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Messages Debug</h2>
      <div>
        <strong>Current User:</strong> {currentUser?.id || 'None'}
      </div>
      <div>
        <strong>Is Loaded:</strong> {isLoaded.toString()}
      </div>
      <div>
        <strong>Loading:</strong> {loading.toString()}
      </div>
      <div>
        <strong>Conversations:</strong> {conversations.length}
      </div>
      
      <h3>Logs:</h3>
      <div style={{ background: '#f5f5f5', padding: '10px', maxHeight: '300px', overflow: 'auto' }}>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
      
      {conversations.length > 0 && (
        <>
          <h3>Conversations:</h3>
          <pre>{JSON.stringify(conversations, null, 2)}</pre>
        </>
      )}
    </div>
  );
};

export default DebugMessages; 