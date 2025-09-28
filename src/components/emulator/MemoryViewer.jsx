import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit } from 'lucide-react';

export default function MemoryViewer({ busInstance, isEmulating }) {
  const [memoryData, setMemoryData] = useState(new Uint8Array(256));
  const [baseAddress, setBaseAddress] = useState(0x02000000);
  const [selectedByte, setSelectedByte] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (!busInstance || !isEmulating) return;
    
    const interval = setInterval(() => {
      const data = new Uint8Array(256);
      for (let i = 0; i < 256; i++) {
        data[i] = busInstance.read8(baseAddress + i);
      }
      setMemoryData(data);
    }, 500);

    return () => clearInterval(interval);
  }, [busInstance, isEmulating, baseAddress]);

  const handleByteClick = (index, value) => {
    setSelectedByte(index);
    setEditValue(value.toString(16).padStart(2, '0').toUpperCase());
  };

  const handleEditSubmit = () => {
    if (!busInstance || selectedByte === null) return;
    
    const newValue = parseInt(editValue, 16);
    if (!isNaN(newValue) && newValue >= 0 && newValue <= 255) {
      busInstance.write8(baseAddress + selectedByte, newValue);
      setSelectedByte(null);
      setEditValue('');
    }
  };

  const formatAddress = (addr) => `0x${addr.toString(16).padStart(8, '0').toUpperCase()}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 text-cyan-400" />
        <span className="text-cyan-400 font-mono text-sm">Live Memory Viewer</span>
        <Input
          type="text"
          value={formatAddress(baseAddress)}
          onChange={(e) => {
            const addr = parseInt(e.target.value, 16);
            if (!isNaN(addr)) setBaseAddress(addr);
          }}
          className="w-32 bg-slate-800 border-slate-600 font-mono text-xs"
        />
      </div>
      
      {!isEmulating && (
        <p className="text-slate-400 text-center py-4 text-sm">Start emulation to view memory</p>
      )}
      
      {isEmulating && (
        <div className="grid grid-cols-16 gap-1 font-mono text-xs">
          {Array.from({ length: 256 }, (_, i) => (
            <button
              key={i}
              onClick={() => handleByteClick(i, memoryData[i])}
              className={`w-6 h-6 border border-slate-600 rounded text-center hover:bg-slate-700 transition-colors
                ${selectedByte === i ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'}
                ${memoryData[i] !== 0 ? 'text-green-400' : 'text-slate-500'}
              `}
              title={`${formatAddress(baseAddress + i)}: 0x${memoryData[i].toString(16).padStart(2, '0')}`}
            >
              {memoryData[i].toString(16).padStart(2, '0').toUpperCase()}
            </button>
          ))}
        </div>
      )}
      
      {selectedByte !== null && (
        <div className="flex items-center gap-2 p-3 bg-slate-800 rounded border border-cyan-400">
          <span className="text-cyan-400 font-mono text-sm">
            {formatAddress(baseAddress + selectedByte)}:
          </span>
          <Input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-16 bg-slate-700 border-slate-600 font-mono text-center"
            maxLength={2}
          />
          <Button size="sm" onClick={handleEditSubmit} className="bg-cyan-600 hover:bg-cyan-700">
            <Edit className="w-3 h-3 mr-1" />
            Write
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSelectedByte(null)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}