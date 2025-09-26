"use client";

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/lib/context/AuthContext";

export default function VoteInfo() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [canVote, setCanVote] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthenticated || !user?.nextVoteAt) {
      setCanVote(true);
      setTimeLeft("");
      return;
    }

    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const nextVoteTime = new Date(user.nextVoteAt!).getTime();
      const difference = nextVoteTime - now;

      if (difference <= 0) {
        setCanVote(true);
        setTimeLeft("");
      } else {
        setCanVote(false);
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user?.nextVoteAt]);

  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-yellow-400 font-medium">
            Oy kullanmak için giriş yapın
          </span>
        </div>
      </div>
    );
  }

  if (canVote) {
    return (
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-medium">
            Şu anda oy verebilirsiniz!
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 text-center">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <span className="text-yellow-400 font-medium">
          Sonraki oy: {timeLeft}
        </span>
      </div>
    </div>
  );
}
