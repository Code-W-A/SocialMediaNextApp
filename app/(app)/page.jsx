"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/home");
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #FFEDC9 0%, #FFF8E7 50%, #FFEDC9 100%)'
    }}>
      <div style={{
        textAlign: 'center',
        color: '#f9aa11',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    </div>
  );
}
