"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Trash2 } from "lucide-react";
import { mockAPI } from "@/lib/mock/api";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Document } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[] | undefined>([]);
  const [loading, setLoading] = useState(true);
  const [documentId] = useState("");

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await mockAPI.getDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await mockAPI.deleteDocument(id);
      setDocuments((prev) => prev?.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const newDoc = await mockAPI.upload(file);
      setDocuments((prev) => [newDoc, ...(prev ?? [])]);
    } catch (error) {
      console.error("Failed to upload document:", error);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto h-[calc(100vh-4rem)] py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-8 mx-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-bold tracking-tight">Documents</h1>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            id="file-upload"
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            placeholder="Enter Document ID"
            value={documentId}
            className="hidden"
          />
          <Label htmlFor="file-upload">
            <button
              className="px-4 py-2 h-10 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => document.getElementById("file-upload")?.click()}>
              Upload Document
            </button>
          </Label>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {documents?.map((doc) => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 h-[10rem]">
              <FileText className="h-8 w-8 text-primary" />
              <div className=" w-11/12">
                <CardTitle>{doc.title}</CardTitle>
                <CardDescription className="mt-2 text-sm">
                  Last modified: {format(new Date(doc.lastModified), "PPP")}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {doc.content}
              </p>
            </CardContent>
            <CardFooter className="justify-between">
              <span className="flex items-center gap-2">
                <Badge
                  variant={"default"}
                  className={cn(
                    doc.status === "failed" && "bg-red-500",
                    doc.status === "processing" && "bg-green-500",
                    doc.status === "completed" && "bg-blue-500",
                    doc.status === "queued" && "bg-yellow-500",
                    "text-xs text-white capitalize"
                  )}>
                  {doc.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Created by {doc.createdBy}
                </span>
              </span>
              <Button
                className="rounded-full"
                variant="ghost"
                onClick={() => handleDelete(doc.id)}>
                <Trash2 className="rounded-full size-5" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
