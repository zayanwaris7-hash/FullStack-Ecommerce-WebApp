import { useAuth } from "@clerk/react";
import * as Sentry from "@sentry/react";

import React, { useEffect } from 'react'

function SyntryScynUserthings() {
    const {isLoaded,userId}=useAuth();
    useEffect(() => {
        if(!isLoaded ) return;
        Sentry.setUser(userId?{id:userId}:null);
    }, [isLoaded,userId])
    
  return null;
}

export default SyntryScynUserthings