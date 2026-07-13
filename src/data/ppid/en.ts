import type { PpidContent } from './types';

const digitalFile = 'Digital File';

export const ppidContentEn: PpidContent = {
  intro: [
    'Law Number 14 of 2008 concerning Public Information Disclosure is an important milestone in encouraging the implementation of information transparency in Indonesia. This law provides a legal basis for every person to obtain information and requires Public Bodies to provide and serve information requests accurately, on time, at low cost, professionally, and through simple procedures.',
    'As part of the commitment of IAIN Bone and the Faculty of Sharia and Islamic Law (FSHI) to public information disclosure, the Information and Documentation Management Officer (PPID) provides various public information that can be accessed by the public in accordance with statutory regulations.',
  ],
  downloadUrl: 'https://febi.iain-bone.ac.id/ppid',
  sections: [
    {
      id: 'berkala',
      number: 1,
      title: 'Public Information Required to Be Announced Periodically',
      description:
        'Information that must be announced periodically as a form of transparency in public service delivery.',
      rows: [
        {
          no: '1',
          title:
            'Information on IAIN Bone including vision and mission, goals and targets, organizational structure, brief profiles of structural officials, map, address, and contact information of IAIN Bone',
          summary:
            'Information on IAIN Bone including vision and mission, goals and targets, organizational structure, brief profiles of structural officials, map, address, and contact information of IAIN Bone',
          unit: 'Public Relations Function, UPT TIPD',
          format: digitalFile,
        },
        {
          no: '2',
          title: 'Leadership LHKPN',
          summary: 'Contains LHKPN information for the Rector and Vice Rectors',
          unit: 'SPI, OKH Function',
          format: digitalFile,
        },
        { no: 'a.', title: 'Rector', summary: 'Contains LHKPN information for the Rector and Vice Rectors', unit: 'SPI, OKH Function', format: digitalFile, isSubRow: true },
        { no: 'b.', title: 'Vice Rector I', summary: 'Contains LHKPN information for the Rector and Vice Rectors', unit: 'SPI, OKH Function', format: digitalFile, isSubRow: true },
        { no: 'c.', title: 'Vice Rector II', summary: 'Contains LHKPN information for the Rector and Vice Rectors', unit: 'SPI, OKH Function', format: digitalFile, isSubRow: true },
        { no: 'd.', title: 'Vice Rector III', summary: 'Contains LHKPN information for the Rector and Vice Rectors', unit: 'SPI, OKH Function', format: digitalFile, isSubRow: true },
        { no: 'e.', title: 'Other Officials', summary: 'Contains LHKPN information for officials required to submit LHKPN', unit: 'SPI, OKH Function', format: digitalFile, isSubRow: true },
        {
          no: '3',
          title: 'Programs or Activities for 2025',
          summary:
            'Provides information on all program and activity names, persons in charge, budget sources and amounts, and implementation schedules',
          unit: 'Planning Function',
          format: digitalFile,
        },
        {
          no: '4',
          title: 'Strategic or Priority Programs for 2025',
          summary:
            'Presents information on strategic/priority programs, including budget sources and amounts, targets and completion realization, and persons in charge',
          unit: 'Planning Function',
          format: digitalFile,
        },
        {
          no: '5',
          title: 'Academic Calendar',
          summary: 'Presents electronic information and digital data.',
          unit: 'Academic Services Subdivision',
          format: digitalFile,
        },
        {
          no: '6',
          title: 'Information Related to the Rights of the Academic Community',
          summary:
            'Presents information related to the rights of the academic community (scholarships, grants, UKT, Indonesia Smart Card, etc.)',
          unit: 'Academic Services Subdivision',
          format: digitalFile,
        },
        {
          no: '7',
          title: 'Information on Recruitment of Prospective Employees and/or State Officials',
          summary:
            'Presents electronic information on employee selection, open selection for leadership positions, and similar processes',
          unit: 'OKH Function',
          format: digitalFile,
        },
        {
          no: '8',
          title: 'Performance Summary of Programs/Activities That Have Been or Are Being Implemented',
          summary:
            'Presents information on the realization achievements of activities that have been or are being implemented in 2025, accompanied by related documents',
          unit: 'Planning Function',
          format: digitalFile,
        },
        {
          no: '9',
          title: 'Annual Report Documents',
          summary: 'Presents electronic information and digital documents on annual reports',
          unit: 'Planning Function',
          format: digitalFile,
        },
        {
          no: '10',
          title: 'Financial Reports',
          summary: 'Audited financial reports.',
          unit: 'Finance Function',
          format: digitalFile,
        },
        { no: 'a.', title: 'Audited financial reports', summary: 'Audited financial reports.', unit: 'Finance Function', format: digitalFile, isSubRow: true },
        { no: 'b.', title: 'Realization of UKT Receipts and Use', summary: 'Presents information in the form of realization of UKT receipts and use for the year', unit: 'Finance Function', format: digitalFile, isSubRow: true },
        { no: 'c.', title: 'Realization of Current-Year Budget Use', summary: 'Presents information in the form of realization of UKT receipts and use', unit: 'Finance Function', format: digitalFile, isSubRow: true },
        { no: 'd.', title: 'Other Financial Information', summary: 'Other financial information.', unit: 'Finance Function', format: digitalFile, isSubRow: true },
        {
          no: '11',
          title: 'Summary of Access to Public Information Reports',
          summary: 'Summary of access to public information reports',
          unit: 'Public Relations Function, PPID',
          format: digitalFile,
        },
        { no: 'a.', title: 'Number of Public Information Requests Received', summary: 'Summary of access to public information reports', unit: 'Public Relations Function, PPID', format: digitalFile, isSubRow: true },
        { no: 'b.', title: 'Time Required to Fulfill Each Public Information Request', summary: 'Summary of access to public information reports', unit: 'Public Relations Function, PPID', format: digitalFile, isSubRow: true },
        { no: 'c.', title: 'Number of Public Information Requests Granted Partially or Fully and Public Information Requests Denied', summary: 'Summary of access to public information reports', unit: 'Public Relations Function, PPID', format: digitalFile, isSubRow: true },
        { no: 'd.', title: 'Reasons for Denial of Public Information Requests', summary: 'Summary of access to public information reports', unit: 'Public Relations Function, PPID', format: digitalFile, isSubRow: true },
        {
          no: '12',
          title: 'Information on Binding Regulations, Decisions, and/or Policies',
          summary: 'Information on binding regulations, decisions, and/or policies',
          unit: 'OKH Function',
          format: digitalFile,
        },
        { no: 'a.', title: 'List of Drafts and Formation Stages', summary: 'Information on binding regulations, decisions, and/or policies', unit: 'OKH Function', format: digitalFile, isSubRow: true },
        { no: 'b.', title: 'List of Laws and Regulations, Decisions, or Policies That Have Been Ratified', summary: 'Information on binding regulations, decisions, and/or policies', unit: 'OKH Function', format: digitalFile, isSubRow: true },
        {
          no: '13',
          title: 'Procedure for Obtaining Public Information',
          summary: 'Presents information on procedures for obtaining public information',
          unit: 'Public Relations Function, PPID',
          format: digitalFile,
        },
        { no: 'a.', title: 'Procedure for Obtaining Public Information', summary: 'Presents information on procedures for obtaining public information', unit: 'Public Relations Function, PPID', format: digitalFile, isSubRow: true },
        { no: 'b.', title: 'Procedure for Filing Objections', summary: 'Presents information on procedures for obtaining public information', unit: 'Public Relations Function, PPID', format: digitalFile, isSubRow: true },
        { no: 'c.', title: 'Procedure for Resolving Public Information Disputes', summary: 'Presents information on procedures for obtaining public information', unit: 'Public Relations Function, PPID', format: digitalFile, isSubRow: true },
        {
          no: '14',
          title:
            'Procedure for Complaints on Abuse of Authority or Violations Committed by Higher Education Officials',
          summary: 'Presents information on procedures for obtaining public information',
          unit: 'SPI',
          format: digitalFile,
        },
      ],
    },
    {
      id: 'setiap-saat',
      number: 2,
      title: 'Information Required to Be Available at All Times',
      description:
        'Information that must be available at all times and can be accessed by the public in accordance with public information service procedures.',
      rows: [
        {
          no: '15',
          title: 'Public Information List',
          summary:
            'Provides the latest Public Information List that has been determined in accordance with Perki 1/2021 format',
          unit: 'Public Relations Function, UPT TIPD',
          format: digitalFile,
        },
        {
          no: '16',
          title: 'Information on PTN regulations, decisions, and/or policies for 2023-2025 consisting of',
          summary: 'Information on PTN regulations, decisions, and/or policies',
          unit: 'OKH Function',
          format: digitalFile,
        },
        { no: 'a.', title: 'Inputs from Various Parties on Regulations, Decisions, and Policies', summary: 'Provides a list of documents containing inputs from various parties on regulations, decisions, or policies being formed', unit: 'OKH Function', format: digitalFile, isSubRow: true },
        { no: 'b.', title: 'Meeting Minutes', summary: 'Provides a list of meeting minutes documents from the process of forming regulations, decisions, or policies', unit: 'OKH Function', format: digitalFile, isSubRow: true },
        { no: 'c.', title: 'Draft regulation, decision, and policy documents being formed', summary: 'Provides a list of draft regulation, decision, and policy documents being formed', unit: 'OKH Function', format: digitalFile, isSubRow: true },
        { no: 'd.', title: 'Documents on the formulation stages of regulations, decisions, or policies being formed', summary: 'Provides a list of documents on the formulation stages of regulations, decisions, or policies being formed', unit: 'OKH Function', format: digitalFile, isSubRow: true },
        { no: 'e.', title: 'Regulation, decision, and/or policy documents that have been issued', summary: 'Provides a list of regulation, decision, and/or policy documents that have been issued.', unit: 'OKH Function', format: digitalFile, isSubRow: true },
        {
          no: '17',
          title: 'Information on Organization, Administration, and Personnel',
          summary: 'Information on organization, administration, and personnel',
          unit: 'OKH Function',
          format: digitalFile,
        },
        { no: 'a.', title: 'Guideline documents for managing organization, administration, personnel, and finance', summary: 'List of guideline documents for managing organization, administration, and personnel', unit: 'OKH Function', format: digitalFile, isSubRow: true },
        { no: 'b.', title: 'Leadership and employee profile documents', summary: 'Leadership and employee profile documents', unit: 'OKH Function', format: digitalFile, isSubRow: true },
        {
          no: '18',
          title:
            'Correspondence of leaders or officials in the implementation of their duties, functions, and authorities for 2023-2025',
          summary:
            'Correspondence of leaders or officials in the implementation of their duties, functions, and authorities for 2023-2025',
          unit: 'General Affairs and Academic Services Division',
          format: digitalFile,
        },
        {
          no: '19',
          title:
            'Number, types, and general overview of violations found in internal supervision and reports on their follow-up actions',
          summary:
            'Number, types, and general overview of violations found in internal supervision and reports on their follow-up actions',
          unit: 'SPI',
          format: digitalFile,
        },
        {
          no: '20',
          title: 'Treasury or inventory data for 2023-2025',
          summary: 'Treasury or inventory data for 2023-2025',
          unit: 'General Affairs and Academic Services Division',
          format: digitalFile,
        },
        {
          no: '21',
          title: 'IAIN Bone Strategic Plan',
          summary: 'IAIN Bone Strategic Plan',
          unit: 'Planning Function',
          format: digitalFile,
        },
      ],
    },
    {
      id: 'serta-merta',
      number: 3,
      title: 'Information Required to Be Announced Immediately',
      description:
        'Information that must be announced immediately when there are circumstances that may threaten the livelihood of many people or public order.',
      rows: [
        {
          no: '22',
          title: 'IAIN Bone activity news',
          summary: 'IAIN Bone activity news',
          unit: 'Public Relations Function, PPID',
          format: digitalFile,
        },
        {
          no: '23',
          title: 'Circulars, instructions, and announcements of the Rector of IAIN Bone',
          summary: 'Circulars, instructions, and announcements of the Rector of IAIN Bone',
          unit: 'Public Relations Function, PPID',
          format: digitalFile,
        },
      ],
    },
  ],
};
