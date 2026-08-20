export interface ReportSummary {
  id: string
  date: string
  time: string
  profile: 'morning' | 'weekly' | 'default' | string
  title: string
  lead: string
  highlights: string[]
  sourceCount: number | null
  totalEntries: number | null
  sections: string[]
}

export interface Section {
  key: string
  title: string
  markdown: string
}

export interface ReportDetail extends Omit<ReportSummary, 'sections'> {
  sections: Section[]
}

export interface SectionEntry {
  report_id: string
  date: string
  time: string
  profile: string
  title: string
  markdown: string
}
