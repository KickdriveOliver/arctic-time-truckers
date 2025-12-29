
import React from 'react';
import { getText } from '../components/utils/translations';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicy() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-amber-900">{getText("privacy.title")}</h1>
      <p className="text-amber-700">{getText("privacy.intro")}</p>

      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">{getText("privacy.responsible.title")}</CardTitle>
        </CardHeader>
        <CardContent className="text-amber-800">
          <p>
            {getText("privacy.responsible.text")}{' '}
            <Link to={createPageUrl('Imprint')} className="text-amber-600 underline">
              {getText("privacy.responsible.link")}
            </Link>
            .
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">{getText("privacy.data.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-amber-800">
          <p>{getText("privacy.data.p1")}</p>
          <div>
            <h3 className="font-semibold text-amber-900">{getText("privacy.data.profile.title")}</h3>
            <p>{getText("privacy.data.profile.text")}</p>
          </div>
          <div>
            <h3 className="font-semibold text-amber-900">{getText("privacy.data.usage.title")}</h3>
            <p>{getText("privacy.data.usage.text")}</p>
          </div>
          <div>
            <h3 className="font-semibold text-amber-900">{getText("privacy.data.storage.title")}</h3>
            <p>{getText("privacy.data.storage.text")}</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li><span className="font-semibold">pringles-language:</span> {getText("privacy.data.storage.lang")}</li>
              <li><span className="font-semibold">pringles-selected-cat:</span> {getText("privacy.data.storage.cat")}</li>
              <li><span className="font-semibold">pringles-cookie-consent:</span> {getText("privacy.data.storage.consent")}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">{getText("privacy.rights.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-amber-800">
          <p>{getText("privacy.rights.intro")}</p>
          <ul className="list-disc list-inside space-y-1">
            <li>{getText("privacy.rights.access")}</li>
            <li>{getText("privacy.rights.rectification")}</li>
            <li>{getText("privacy.rights.erasure")}</li>
            <li>{getText("privacy.rights.restriction")}</li>
            <li>{getText("privacy.rights.portability")}</li>
            <li>{getText("privacy.rights.objection")}</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">{getText("privacy.data.funDisclaimer.title")}</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 italic">
          <p>{getText("privacy.data.funDisclaimer.text")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
