// Sample JSON for a KnowledgeEntry:
// {
//   "category": "Data Formats",
//   "topic": "Pokemon Encounter Data Structure",
//   "content": "Wild encounters per area: 12 grass slots, 5 water slots, 2 fishing slots (old rod), 3 fishing (good rod), 5 fishing (super rod). Slot probabilities: Grass (20%, 20%, 10%, 10%, 10%, 10%, 5%, 5%, 4%, 4%, 1%, 1%), Water (60%, 30%, 5%, 4%, 1%). Level ranges stored as min/max pairs. Special encounters (swarms, time-based) use separate tables. Repel blocks Pokemon lower than party lead's level.",
//   "keywords": ["encounters", "wild", "grass", "water", "fishing", "probabilities", "slots", "levels", "repel", "swarms"]
// }

import React, { createContext, useContext, useEffect, useState } from 'react';
import { KnowledgeEntry } from '@/api/entities';

const KnowledgeContext = createContext({ entries: [], loading: true, reload: () => {} });

export const KnowledgeProvider = ({ children }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const allEntries = await KnowledgeEntry.list('-created_date');
      setEntries(allEntries);
    } catch (_e) {
      setEntries([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  // Wrap children with provider
  return (
    <KnowledgeContext.Provider value={{ entries, loading, reload }}>
      {children}
    </KnowledgeContext.Provider>
  );
};

export const useKnowledge = () => useContext(KnowledgeContext);
