
import React from 'react';
import { getText } from '../components/utils/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Imprint() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-amber-900">{getText("imprint.title")}</h1>
      
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">{getText("imprint.operatorTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-amber-800">
<p >Kickdrive Software Solutions e.K.</p>
<p >Robert-Bosch-Str. 5</p>
<p >88677 Markdorf</p>
<p >Germany</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">{getText("imprint.contactTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-amber-800">
           <p><span className="font-semibold">{getText("imprint.emailLabel")}:</span>{' '}
            <a href="mailto:pringles@arctictime.de" className="text-amber-600 underline hover:text-amber-800 transition-colors">
              pringles@arctictime.de
            </a>
           </p>
           <p className="text-sm italic text-amber-700 pt-2">{getText("imprint.contactNote")}</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">{getText("imprint.disclaimerTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-amber-700">
          <p>{getText("imprint.disclaimerText1")}</p>
          <p>{getText("imprint.disclaimerText2")}</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">{getText("imprint.funDisclaimerTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 italic">
          <p>{getText("imprint.funDisclaimerText")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
