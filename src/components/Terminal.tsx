import { TerminalIcon } from "lucide-react"

type TerminalProps = {
  title: string;
  output: string[];
  isConnecting: boolean;
  isExecuting: boolean;
  onClose?: () => void;
}

export const Terminal = ({ output, title, isConnecting, isExecuting, onClose }: TerminalProps) => {
  return (
    <>
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <TerminalIcon className="text-green-400" size={24} />
                <h1 className="text-xl font-bold text-white">
                    {title}
                </h1>
            </div>
            <div className="flex gap-1">
                {onClose ? (
                    <div className="h-4 w-4 cursor-pointer rounded-full bg-red-500 text-white flex items-center justify-center text-xs" onClick={onClose}>x</div>
                ) : (
                    <>
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </>
                )}
            </div>
        </div>
        <div className="bg-gray-950 text-green-400 font-mono p-5 rounded-xl h-52 overflow-y-auto overflow-x-auto mb-5 border border-gray-800 shadow-inner h-[90%]">
            {output.map((line: string, index: number) => (
              <div key={index} className="mb-1 whitespace-nowrap">
                {line}
              </div>
            ))}
            {(isConnecting || isExecuting) && (
              <div className="inline-block h-4 w-2 bg-green-500 animate-pulse ml-1"></div>
            )}
        </div>
    </>
  )
}