import {
    PromptInput,
    PromptInputAction,
    PromptInputActions,
    PromptInputTextarea,
} from "@/components/ui/prompt-input";
import {
    ArrowUp,
    Globe,
    Mic,
    MoreHorizontal,
    Paperclip,
    Plus,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState, ChangeEvent } from "react";
import { UIDataTypes, UIMessagePart, UITools } from "ai";

interface ChatInputProps {
    isLoading: boolean;
    stop: () => void;
    onSubmit: (message: { parts: UIMessagePart<UIDataTypes, UITools>[] }) => void;
    className?: string;
}

export function ChatInput({ isLoading, stop, onSubmit, className }: ChatInputProps) {
    const [input, setInput] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const uploadInputRef = useRef<HTMLInputElement>(null);

    const fileToDataURL = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(file);
        });

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const text = input?.trim();

        if (!text && files.length === 0) return;

        // clear input optimistically
        setInput("");
        setFiles([]);
        if (uploadInputRef.current) uploadInputRef.current.value = "";

        try {
            // build parts: include text part if present, and file parts for each file
            const parts: Array<UIMessagePart<UIDataTypes, UITools>> = [];
            if (text) parts.push({ type: "text", text });

            for (const file of files) {
                // convert file to data url
                const dataUrl = await fileToDataURL(file);
                parts.push({
                    type: "file",
                    mediaType: file.type,
                    filename: file.name,
                    url: dataUrl,
                });
            }

            onSubmit({ parts });
        } catch (err) {
            console.error("Failed to process message:", err);
            // Restore input if error occurs (optional, but good UX)
            if (text) setInput(text);
        }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files);
            setFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        if (uploadInputRef.current) {
            uploadInputRef.current.value = "";
        }
    };

    return (
        <div className={className}>
            <div className="mx-auto max-w-3xl">
                <PromptInput
                    isLoading={isLoading}
                    value={input}
                    onValueChange={setInput}
                    onSubmit={handleSubmit}
                    className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
                >
                    {/* Files preview */}
                    {files.length > 0 && (
                        <div className="flex flex-wrap gap-2 px-4 pt-2">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-900 text-sm"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Paperclip className="h-4 w-4 text-slate-600" />
                                    <span className="max-w-[160px] truncate">
                                        {file.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFile(index)}
                                        className="rounded-full p-1 transition hover:bg-slate-200"
                                        aria-label={`Remove ${file.name}`}
                                    >
                                        <X className="h-4 w-4 text-slate-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col">
                        <PromptInputTextarea
                            placeholder="Ask anything"
                            className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
                        />

                        <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
                            <div className="flex items-center gap-2">
                                <PromptInputAction tooltip="Add a new action">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-9 rounded-full"
                                        onClick={() => uploadInputRef.current?.click()}
                                    >
                                        <Plus size={18} />
                                    </Button>
                                </PromptInputAction>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                    ref={uploadInputRef}
                                    aria-label="File upload"
                                />

                                <PromptInputAction tooltip="Search">
                                    <Button variant="outline" className="rounded-full">
                                        <Globe size={18} />
                                        Search
                                    </Button>
                                </PromptInputAction>

                                <PromptInputAction tooltip="More actions">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-9 rounded-full"
                                    >
                                        <MoreHorizontal size={18} />
                                    </Button>
                                </PromptInputAction>
                            </div>
                            <div className="flex items-center gap-2">
                                <PromptInputAction tooltip="Voice input">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-9 rounded-full"
                                    >
                                        <Mic size={18} />
                                    </Button>
                                </PromptInputAction>

                                <Button
                                    size="icon"
                                    disabled={!input.trim() || isLoading}
                                    onClick={handleSubmit}
                                    className="size-9 rounded-full"
                                >
                                    {!isLoading ? (
                                        <ArrowUp size={18} />
                                    ) : (
                                        <span className="size-3 rounded-xs bg-white" />
                                    )}
                                </Button>
                            </div>
                        </PromptInputActions>
                    </div>
                </PromptInput>
            </div>
        </div>
    )
}