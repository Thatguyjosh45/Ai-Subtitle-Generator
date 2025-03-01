import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, FileText, Download, Globe } from "lucide-react";

export default function SubtitleGenerator() {
  const [file, setFile] = useState(null);
  const [subtitles, setSubtitles] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [translatedSubtitles, setTranslatedSubtitles] = useState("");

  const handleUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("language", language);

    try {
      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer YOUR_OPENAI_API_KEY`,
        },
        body: formData,
      });
      const data = await response.json();
      setSubtitles(data.text || "No subtitles generated.");
    } catch (error) {
      console.error("Error generating subtitles:", error);
      setSubtitles("Failed to generate subtitles.");
    }
    setLoading(false);
  };

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.openai.com/v1/translate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer YOUR_OPENAI_API_KEY`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: subtitles,
          target_language: "es", // Change target language as needed
        }),
      });
      const data = await response.json();
      setTranslatedSubtitles(data.translation || "Translation failed.");
    } catch (error) {
      console.error("Error translating subtitles:", error);
      setTranslatedSubtitles("Failed to translate subtitles.");
    }
    setLoading(false);
  };

  const handleDownload = (format, content) => {
    const element = document.createElement("a");
    const fileContent = content.replace(/\n/g, "\r\n");
    const fileBlob = new Blob([fileContent], { type: "text/plain" });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `subtitles.${format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <Card className="w-full max-w-md p-4">
        <CardContent className="flex flex-col items-center gap-4">
          <Select onChange={(e) => setLanguage(e.target.value)} className="w-full">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </Select>
          <Input type="file" accept="video/*" onChange={handleUpload} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2 text-blue-500">
            <UploadCloud size={32} />
            <span>{file ? file.name : "Upload Video"}</span>
          </label>
          {loading && <p>Processing...</p>}
          {subtitles && (
            <div className="w-full p-4 border rounded bg-gray-100 text-sm">
              <FileText size={20} className="mb-2" />
              <pre>{subtitles}</pre>
              <Button onClick={handleTranslate} className="mt-2 text-blue-500">
                <Globe size={16} /> Translate
              </Button>
              <div className="flex gap-2 mt-2">
                <Button onClick={() => handleDownload("srt", subtitles)} className="text-blue-500">
                  <Download size={16} /> SRT
                </Button>
                <Button onClick={() => handleDownload("vtt", subtitles)} className="text-blue-500">
                  <Download size={16} /> VTT
                </Button>
                <Button onClick={() => handleDownload("txt", subtitles)} className="text-blue-500">
                  <Download size={16} /> TXT
                </Button>
              </div>
            </div>
          )}
          {translatedSubtitles && (
            <div className="w-full p-4 border rounded bg-gray-100 text-sm">
              <FileText size={20} className="mb-2" />
              <pre>{translatedSubtitles}</pre>
              <div className="flex gap-2 mt-2">
                <Button onClick={() => handleDownload("srt", translatedSubtitles)} className="text-blue-500">
                  <Download size={16} /> Translated SRT
                </Button>
                <Button onClick={() => handleDownload("vtt", translatedSubtitles)} className="text-blue-500">
                  <Download size={16} /> Translated VTT
                </Button>
                <Button onClick={() => handleDownload("txt", translatedSubtitles)} className="text-blue-500">
                  <Download size={16} /> Translated TXT
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
