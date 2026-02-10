
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Clock,
  BarChart3,
  Folder,
  PlusCircle,
  Play,
  Pause,
  Save,
  Users,
  Snowflake,
  Navigation,
  Coffee } from
"lucide-react";
import { getText } from "../components/utils/translations";

export default function Guide() {
  const [update, setUpdate] = useState(0);

  useEffect(() => {
    const handleLanguageChange = () => {
      setUpdate((prev) => prev + 1);
    };

    window.addEventListener("language-changed", handleLanguageChange);
    return () => {
      window.removeEventListener("language-changed", handleLanguageChange);
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-amber-900 mb-4 flex items-center justify-center gap-3">
          <span>🐱</span>
          {getText("guide.title")}
          <span>🚛</span>
        </h1>
        <p className="text-amber-700 text-lg mb-6">
          {getText("guide.subtitle")}
        </p>

        {/* Cat Truck Stop Party Image - REMOVED from here as per outline */}
      </div>

      <Tabs defaultValue="story" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-amber-100 border-amber-200">
          <TabsTrigger value="story" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
            📖 {getText("guide.tabs.story")}
          </TabsTrigger>
          <TabsTrigger value="getting-started" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
            🚀 {getText("guide.tabs.gettingStarted")}
          </TabsTrigger>
          <TabsTrigger value="features" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
            ⚙️ {getText("guide.tabs.features")}
          </TabsTrigger>
          <TabsTrigger value="tips" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
            💡 {getText("guide.tabs.tips")}
          </TabsTrigger>
        </TabsList>

        {/* The Pringles Story Tab */}
        <TabsContent value="story" className="mt-6">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardHeader>
              <CardTitle className="font-semibold tracking-tight flex items-center gap-3 text-2xl text-amber-900">
                📜{getText("guide.story.cardTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-amber-800 flex items-center gap-2">
                    <span>🐱</span>
                    {getText("guide.story.beginTitle")}
                  </h3>
                  <p className="text-amber-700">{getText("guide.story.p1")}</p>
                  <p className="text-amber-700">{getText("guide.story.p2")}</p>
                </div>

                <div className="relative">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/680fc11cf00ff52d15b7d900/02dd30f27_arctic_diner.jpg"
                    alt="Pringles and Aurora in a diner"
                    className="rounded-xl shadow-lg border-4 border-amber-200"
                  />
                  <p className="text-center text-xs italic text-amber-700 mt-2 bg-amber-100/50 backdrop-blur-sm p-2 rounded-b-lg">
                    {getText("guide.story.dinerCaption")}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-amber-700">{getText("guide.story.p3")}</p>
                <div className="bg-amber-100 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-3">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4c3636_pringes_at_trucking.jpeg"
                      alt="Pringles, the founder"
                      className="w-16 h-16 rounded-full object-cover border-2 border-amber-300" />

                    <div>
                      <p className="text-amber-800 italic">
                        {getText("guide.story.founderQuote")}
                      </p>
                      <p className="text-amber-600 text-sm mt-2">
                        {getText("guide.story.founderByline")}
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-amber-800 flex items-center gap-2">
                  <span>🌟</span>
                  {getText("guide.story.auroraTitle")}
                </h3>
                <p className="text-amber-700">
                  {getText("guide.story.auroraP")}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Getting Started Tab */}
        <TabsContent value="getting-started" className="mt-6">
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-amber-900">
                  <span>🚀</span>
                  {getText("guide.gettingStarted.welcomeTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="flex items-start gap-4 p-4 bg-amber-100 rounded-lg">
                    <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                    <div>
                      <h3 className="font-semibold text-amber-900 mb-2">{getText("guide.gettingStarted.step1Title")}</h3>
                      <p className="text-amber-700">{getText("guide.gettingStarted.step1Text")}</p>
                      <p className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 border border-gray-200 rounded-md">
                        <span className="font-semibold">{getText("guide.gettingStarted.humanSpeakPrefix")}</span>{getText("guide.gettingStarted.step1Human")}
                      </p>
                      <Badge className="mt-2 bg-amber-200 text-amber-800">
                        {getText("guide.gettingStarted.proTipBadge")}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-amber-100 rounded-lg">
                    <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                    <div>
                      <h3 className="font-semibold text-amber-900 mb-2">{getText("guide.gettingStarted.step2Title")}</h3>
                      <p className="text-amber-700">{getText("guide.gettingStarted.step2Text")}</p>
                      <p className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 border border-gray-200 rounded-md">
                        <span className="font-semibold">{getText("guide.gettingStarted.humanSpeakPrefix")}</span>{getText("guide.gettingStarted.step2Human")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-amber-100 rounded-lg">
                    <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                    <div>
                      <h3 className="font-semibold text-amber-900 mb-2">{getText("guide.gettingStarted.step3Title")}</h3>
                      <p className="text-amber-700">{getText("guide.gettingStarted.step3Text")}</p>
                      <p className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 border border-gray-200 rounded-md">
                        <span className="font-semibold">{getText("guide.gettingStarted.humanSpeakPrefix")}</span>{getText("guide.gettingStarted.step3Human")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-amber-100 rounded-lg">
                    <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</div>
                    <div>
                      <h3 className="font-semibold text-amber-900 mb-2">{getText("guide.gettingStarted.step4Title")}</h3>
                      <p className="text-amber-700">{getText("guide.gettingStarted.step4Text")}</p>
                      <p className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 border border-gray-200 rounded-md">
                        <span className="font-semibold">{getText("guide.gettingStarted.humanSpeakPrefix")}</span>{getText("guide.gettingStarted.step4Human")}
                      </p>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Features Guide Tab */}
        <TabsContent value="features" className="mt-6">
          <div className="grid gap-6">
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-amber-900">
                  <Snowflake className="h-6 w-6" />
                  {getText("guide.features.dashboardTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 mb-4">{getText("guide.features.dashboardDesc")}</p>
                <p className="text-sm text-gray-700 p-3 bg-gray-100 rounded-lg border border-gray-200 mb-4">
                  <span className="font-semibold">{getText("guide.features.professionalAnalogyPrefix")}</span>{getText("guide.features.dashboardAnalogy")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-800">{getText("guide.features.dailyStats")}</Badge>
                  <Badge className="bg-green-100 text-green-800">{getText("guide.features.weeklyOverview")}</Badge>
                  <Badge className="bg-purple-100 text-purple-800">{getText("guide.features.monthlyProgress")}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-amber-900">
                  <Clock className="h-6 w-6" />
                  {getText("guide.features.timerTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-amber-700">{getText("guide.features.timerDesc")}</p>
                  <p className="text-sm text-gray-700 p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <span className="font-semibold">{getText("guide.features.professionalAnalogyPrefix")}</span>{getText("guide.features.timerAnalogy")}
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg">
                      <Play className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 font-medium">{getText("timer.start")}</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-amber-100 rounded-lg">
                      <Pause className="h-5 w-5 text-amber-600" />
                      <span className="text-amber-800 font-medium">{getText("timer.pause")}</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-blue-100 rounded-lg">
                      <Save className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-800 font-medium">{getText("timer.save")}</span>
                    </div>
                  </div>
                  <Badge className="bg-amber-200 text-amber-800">
                    {getText("guide.features.timerAdjustTip")}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-amber-900">
                  <Folder className="h-6 w-6" />
                  {getText("guide.features.projectsTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 mb-4">{getText("guide.features.projectsDesc")}</p>
                <p className="text-sm text-gray-700 p-3 bg-gray-100 rounded-lg border border-gray-200 mb-4">
                  <span className="font-semibold">{getText("guide.features.professionalAnalogyPrefix")}</span>{getText("guide.features.projectsAnalogy")}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-amber-800">{getText("projects.newProject")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-amber-800">{getText("projects.edit")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-amber-800">{getText("projects.archive")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-amber-900">
                  <BarChart3 className="h-6 w-6" />
                  {getText("guide.features.reportsTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700">{getText("guide.features.reportsDesc")}</p>
                <p className="text-sm text-gray-700 p-3 bg-gray-100 rounded-lg border border-gray-200 mt-4">
                  <span className="font-semibold">{getText("guide.features.professionalAnalogyPrefix")}</span>{getText("guide.features.reportsAnalogy")}
                </p>
                <Badge className="bg-green-200 text-green-800 mt-2">{getText("guide.features.exportReady")}</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pro Tips Tab */}
        <TabsContent value="tips" className="mt-6">
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-amber-900">
                  <span>🎓</span>
                  {getText("guide.tips.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Pringles' Tips */}
                <div className="bg-amber-100 p-4 rounded-lg border border-amber-200">
                  <div className="grid md:grid-cols-3 gap-6 items-center">
                    <div className="relative md:col-span-1">
                      <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/680fc11cf00ff52d15b7d900/3d9d82def_pringles_checklist.jpg"
                        alt="Pringles planning a route"
                        className="rounded-xl shadow-lg border-4 border-amber-200 w-full"
                      />
                      <p className="text-center text-xs italic text-amber-700 mt-2 bg-amber-50/50 backdrop-blur-sm p-2 rounded-b-lg">
                        {getText("guide.tips.checklistCaption")}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-start gap-3">
                         <img
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4c3636_pringes_at_trucking.jpeg"
                          alt="Pringles"
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-300" />
                        <div>
                          <h3 className="font-semibold text-amber-900 mb-2">{getText("guide.tips.pringlesTitle")}</h3>
                          <ul className="space-y-2 text-amber-700">
                            <li>• {getText("guide.tips.pr1")}</li>
                            <li>• {getText("guide.tips.pr2")}</li>
                            <li>• {getText("guide.tips.pr3")}</li>
                            <li>• {getText("guide.tips.pr4")}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aurora's Tips */}
                <div className="bg-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-start gap-3">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/680fc11cf00ff52d15b7d900/75abe1cbe_aurora_truck.jpg"
                      alt="Aurora"
                      className="w-12 h-12 rounded-full object-cover border-2 border-purple-300" />

                    <div>
                      <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                        {getText("guide.tips.auroraTitle")}
                        <span className="text-xs">🎵</span>
                      </h3>
                      <ul className="space-y-2 text-purple-700">
                        <li>• {getText("guide.tips.au1")}</li>
                        <li>• {getText("guide.tips.au2")}</li>
                        <li>• {getText("guide.tips.au3")}</li>
                        <li>• {getText("guide.tips.au4")}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* General Tips */}
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-900">
                      <Coffee className="h-5 w-5" />
                      {getText("guide.tips.generalTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-amber-800 mb-2">{getText("guide.tips.timeTitle")}</h4>
                        <p className="text-xs text-gray-500 mb-2 italic">{getText("guide.tips.timeDesc")}</p>
                        <ul className="text-sm text-amber-700 space-y-1">
                          {getText("guide.tips.timeItems").map((t, i) => (<li key={i}>• {t}</li>))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-amber-800 mb-2">{getText("guide.tips.routesTitle")}</h4>
                        <p className="text-xs text-gray-500 mb-2 italic">{getText("guide.tips.routesDesc")}</p>
                        <ul className="text-sm text-amber-700 space-y-1">
                          {getText("guide.tips.routesItems").map((t, i) => (<li key={i}>• {t}</li>))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Tips */}
                <div className="bg-blue-100 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <span>🔒</span>
                    {getText("guide.tips.securityTitle")}
                  </h3>
                  <p className="text-xs text-blue-800 mb-2 italic">{getText("guide.tips.secDesc")}</p>
                  <ul className="space-y-2 text-blue-700">
                    {getText("guide.tips.secItems").map((t, i) => (<li key={i}>• {t}</li>))}
                  </ul>
                </div>

              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center py-8 border-t border-amber-200">
        <div className="max-w-3xl mx-auto mb-6">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/680fc11cf00ff52d15b7d900/7d8e0ba6d_cat_truck_stop.jpg"
            alt="Annual Cat Truck Stop Party"
            className="rounded-xl shadow-lg border-4 border-amber-200 w-full"
          />
          <p className="text-center text-sm italic text-amber-700 mt-2 bg-amber-100/50 backdrop-blur-sm p-2 rounded-b-lg">
            {getText("guide.partyCaption")}
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-2xl">🐾</span>
          <p className="text-amber-700 italic">
            {getText("guide.footer.quote")}
          </p>
          <span className="text-2xl">🐾</span>
        </div>
        <p className="text-amber-600 text-sm">
          {getText("guide.footer.team")}
        </p>
      </div>
    </div>);

}
