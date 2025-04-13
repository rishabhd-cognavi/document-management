"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AccordionItem } from "@/components/ui/accordion";
import { useEffect, useState } from "react";
import { mockAPI } from "@/lib/mock/api";
import { Brain, FileText, Loader2 } from "lucide-react";
import { QAItem, QAResponse } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function QAPage() {
  const [value, setValue] = useState<QAItem[] | undefined>(undefined);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<QAResponse | null>(null);

  useEffect(() => {
    (async () => {
      const docs = await mockAPI.getQAItems();
      setValue(docs);
    })();
  }, []);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const answer = await mockAPI.ask(question);
      setResponse(answer);
    } catch (error) {
      console.error("Failed to get answer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Ask a Question
            </CardTitle>
          </CardHeader>
          <CardContent className=" inline-flex w-full gap-2">
            <Input
              label=""
              placeholder="Type your question here..."
              value={question}
              className="w-full"
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAskQuestion();
                }
              }}
            />
            <Button
              onClick={handleAskQuestion}
              disabled={isLoading}
              variant="default"
              className="mt-1 text-white w-24">
              {isLoading ? "Thinking..." : "Ask"}
            </Button>
          </CardContent>
        </Card>

        {response && (
          <Card>
            <CardHeader>
              <CardTitle>Answer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap mb-6">{response.answer}</p>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Source Documents:
                </h3>
                {response.sourceDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                      <FileText className="h-4 w-4" />
                      {doc.title}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {doc.excerpt}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Find answers to common questions about our services
            </CardDescription>
          </CardHeader>
          <CardContent>
            {value === undefined && (
              <div className="mb-4 h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            {value?.map((item) => (
              <AccordionItem
                key={item.id}
                trigger={item.question}
                className="w-full">
                {item.answer}
              </AccordionItem>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
