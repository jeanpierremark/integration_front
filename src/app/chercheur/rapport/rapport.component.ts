import { Component } from '@angular/core';

export interface ReportSection {
  id: number;
  title: string;
  content: string;
  type: 'text' | 'chart' | 'image';
  chartData?: {
    type: string;
    title: string;
    data: any[];
  };
}

export interface Report {
  title: string;
  subtitle: string;
  author: string;
  date: string;
  location: string;
  period: {
    start: string;
    end: string;
  };
  executive_summary: string;
  sections: ReportSection[];
}

@Component({
  selector: 'app-rapport',
  templateUrl: './rapport.component.html',
  styleUrls: ['./rapport.component.css']
})
export class RapportComponent {
  report: Report = {
    title: '',
    subtitle: '',
    author: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    period: {
      start: '',
      end: ''
    },
    executive_summary: '',
    sections: [
      {
        id: 1,
        title: 'Introduction',
        content: '',
        type: 'text'
      }
    ]
  };

  activeSection: number = 1;
  previewMode: boolean = false;
  user = sessionStorage.getItem('prenom')+''+sessionStorage.getItem('nom');
  chartTypes = [
    { value: 'temperature', label: 'Évolution des Températures' },
    { value: 'precipitation', label: 'Précipitations' },
    { value: 'humidity', label: 'Humidité' },
    { value: 'wind', label: 'Vitesse du Vent' }
  ];

  addSection(type: 'text' | 'chart' | 'image' = 'text'): void {
    const newSection: ReportSection = {
      id: Date.now(),
      title: `Nouvelle Section ${this.report.sections.length + 1}`,
      content: '',
      type: type,
      chartData: type === 'chart' ? {
        type: 'temperature',
        title: 'Évolution des Températures',
        data: []
      } : undefined
    };
    
    this.report.sections.push(newSection);
    this.activeSection = newSection.id;
  }

  updateSection(id: number, field: string, value: any): void {
    const sectionIndex = this.report.sections.findIndex(section => section.id === id);
    if (sectionIndex !== -1) {
      if (field === 'chartData') {
        this.report.sections[sectionIndex].chartData = value;
      } else {
        (this.report.sections[sectionIndex] as any)[field] = value;
      }
    }
  }

  deleteSection(id: number): void {
    this.report.sections = this.report.sections.filter(section => section.id !== id);
    if (this.activeSection === id && this.report.sections.length > 0) {
      this.activeSection = this.report.sections[0].id;
    }
  }

  getActiveSection(): ReportSection | undefined {
    return this.report.sections.find(section => section.id === this.activeSection);
  }

  getSectionIcon(type: string): string {
    switch (type) {
      case 'chart': return 'bar-chart';
      case 'image': return 'image';
      default: return 'file-earmark-text';
    }
  }

  formatTextWithMarkdown(text: string): string {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  togglePreview(): void {
    this.previewMode = !this.previewMode;
  }

  saveReport(): void {
    console.log('Sauvegarde du rapport:', this.report);
    // Implémentez ici la logique de sauvegarde
    alert('Rapport sauvegardé avec succès!');
  }

  exportToPDF(): void {
    console.log('Export PDF du rapport:', this.report);
    // Implémentez ici la logique d'export PDF
    alert('Export PDF en cours...');
  }

  onSectionTitleChange(id: number, title: string): void {
    this.updateSection(id, 'title', title);
  }

  onSectionContentChange(id: number, content: string): void {
    this.updateSection(id, 'content', content);
  }

  onChartTypeChange(id: number, chartType: string): void {
    const section = this.getActiveSection();
    if (section && section.chartData) {
      const updatedChartData = {
        ...section.chartData,
        type: chartType
      };
      this.updateSection(id, 'chartData', updatedChartData);
    }
  }

  setActiveSection(id: number): void {
    this.activeSection = id;
  }

  configureChartData(): void {
    console.log('Configuration des données du graphique');
    // Implémentez ici la logique de configuration des données
    alert('Configuration des données du graphique...');
  }

  // Méthodes de formatage de texte
  insertFormatting(format: string): void {
    const activeSection = this.getActiveSection();
    if (!activeSection) return;

    const textarea = document.querySelector('.form-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    let newText = '';
    let cursorPosition = start;

    switch (format) {
      case 'bold':
        newText = selectedText ? `**${selectedText}**` : '****';
        cursorPosition = selectedText ? end + 4 : start + 2;
        break;
      case 'italic':
        newText = selectedText ? `*${selectedText}*` : '**';
        cursorPosition = selectedText ? end + 2 : start + 1;
        break;
      case 'underline':
        newText = selectedText ? `__${selectedText}__` : '____';
        cursorPosition = selectedText ? end + 4 : start + 2;
        break;
      case 'strikethrough':
        newText = selectedText ? `~~${selectedText}~~` : '~~~~';
        cursorPosition = selectedText ? end + 4 : start + 2;
        break;
      case 'code':
        newText = selectedText ? `\`${selectedText}\`` : '``';
        cursorPosition = selectedText ? end + 2 : start + 1;
        break;
      case 'quote':
        newText = selectedText ? `> ${selectedText}` : '> ';
        cursorPosition = selectedText ? end + 2 : start + 2;
        break;
      case 'list':
        newText = selectedText ? `- ${selectedText}` : '- ';
        cursorPosition = selectedText ? end + 2 : start + 2;
        break;
      case 'numberedList':
        newText = selectedText ? `1. ${selectedText}` : '1. ';
        cursorPosition = selectedText ? end + 3 : start + 3;
        break;
      case 'link':
        newText = selectedText ? `[${selectedText}](url)` : '[texte](url)';
        cursorPosition = selectedText ? end + 6 : start + 11;
        break;
      case 'heading1':
        newText = selectedText ? `# ${selectedText}` : '# ';
        cursorPosition = selectedText ? end + 2 : start + 2;
        break;
      case 'heading2':
        newText = selectedText ? `## ${selectedText}` : '## ';
        cursorPosition = selectedText ? end + 3 : start + 3;
        break;
      case 'heading3':
        newText = selectedText ? `### ${selectedText}` : '### ';
        cursorPosition = selectedText ? end + 4 : start + 4;
        break;
      default:
        return;
    }

    const fullText = beforeText + newText + afterText;
    this.updateSection(this.activeSection, 'content', fullText);

    // Remettre le focus et la position du curseur
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  }

  insertAlignment(alignment: string): void {
    const activeSection = this.getActiveSection();
    if (!activeSection) return;

    const textarea = document.querySelector('.form-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    let alignmentTag = '';
    switch (alignment) {
      case 'left':
        alignmentTag = '<div style="text-align: left;">';
        break;
      case 'center':
        alignmentTag = '<div style="text-align: center;">';
        break;
      case 'right':
        alignmentTag = '<div style="text-align: right;">';
        break;
      case 'justify':
        alignmentTag = '<div style="text-align: justify;">';
        break;
    }

    const newText = selectedText 
      ? `${alignmentTag}${selectedText}</div>` 
      : `${alignmentTag}</div>`;
    
    const fullText = beforeText + newText + afterText;
    this.updateSection(this.activeSection, 'content', fullText);

    const cursorPosition = selectedText ? end + alignmentTag.length + 6 : start + alignmentTag.length;
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  }

  insertClimateIcon(iconType: string): void {
    const activeSection = this.getActiveSection();
    if (!activeSection) return;

    const textarea = document.querySelector('.form-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(start);

    const fullText = beforeText + ' ' + afterText;
    this.updateSection(this.activeSection, 'content', fullText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 2, start + 2);
    }, 0);
  }
}