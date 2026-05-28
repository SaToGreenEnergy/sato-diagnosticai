declare function gtag(...args: unknown[]): void;

function track(eventName: string, params?: Record<string, unknown>) {
  try {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, params);
    }
  } catch {}
}

export const analytics = {
  scanStarted: () => track('scan_started'),
  diagnosisCompleted: (component: string, condition: string, issueCount: number) =>
    track('diagnosis_completed', { component, condition, issue_count: issueCount }),
  criticalIssueFound: (component: string) =>
    track('critical_issue_found', { component }),
  catalogViewed: (category: string) =>
    track('catalog_viewed', { category }),
  equipmentOpened: (equipmentId: string, equipmentName: string) =>
    track('equipment_opened', { equipment_id: equipmentId, equipment_name: equipmentName }),
  contactClicked: (source: string, equipmentName?: string) =>
    track('contact_clicked', { source, equipment_name: equipmentName }),
  premiumViewed: () => track('premium_viewed'),
  premiumActivated: () => track('premium_activated'),
  reportDownloaded: (component: string) =>
    track('report_downloaded', { component }),
  languageChanged: (lang: string) =>
    track('language_changed', { language: lang }),
  currencyChanged: (currency: string) =>
    track('currency_changed', { currency }),
};
