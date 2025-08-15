import React, { useState, useEffect } from 'react';
import { Filter, Plus, ChevronLeft, ChevronRight, Search, ChevronDown, Globe, X } from 'lucide-react';

// Mock translations
const ptTranslations = {
  "Meus Trabalhos": "Meus Trabalhos",
  "allWorks": "Todos os trabalhos",
  "category": "Categoria",
  "status": "Status",
  "statusTypes": {
    "Rascunho": "Rascunho",
    "Enviado": "Enviado", 
    "Retornado": "Retornado",
    "Aprovado": "Aprovado"
  },
  "workTypes": {
    "Artigo": "Artigo",
    "TCC": "TCC",
    "Projeto": "Projeto",
    "Dissertação": "Dissertação",
    "Tese": "Tese"
  },
  "results": "resultado",
  "resultados": "resultados",
  "page": "Página",
  "of": "de",
  "authors": "Autores",
  "date": "Data",
  "imageText": "Imagem do trabalho",
  "noWorksFound": "Nenhum trabalho encontrado",
  "noWorksFoundDesc": "Tente ajustar os filtros ou criar um novo trabalho",
  "noWorksYet": "Você ainda não possui trabalhos",
  "createNewWork": "Criar Novo Trabalho",
  "createFirstWork": "Criar Primeiro Trabalho",
  "Novo Trabalho": "Novo Trabalho",
  "filterByStatus": "Filtrar por Status",
  "selectedStatus": "Status Selecionado",
  "clearFilter": "Limpar Filtro",
  "applyFilter": "Aplicar Filtro",
  "cancel": "Cancelar"
};

const enTranslations = {
  "Meus Trabalhos": "My Works",
  "allWorks": "All works",
  "category": "Category", 
  "status": "Status",
  "statusTypes": {
    "Rascunho": "Draft",
    "Enviado": "Submitted",
    "Retornado": "Returned", 
    "Aprovado": "Approved"
  },
  "workTypes": {
    "Artigo": "Article",
    "TCC": "Thesis",
    "Projeto": "Project",
    "Dissertação": "Dissertation",
    "Tese": "Thesis"
  },
  "results": "result",
  "resultados": "results", 
  "page": "Page",
  "of": "of",
  "authors": "Authors",
  "date": "Date",
  "imageText": "Work image",
  "noWorksFound": "No works found",
  "noWorksFoundDesc": "Try adjusting filters or creating a new work",
  "noWorksYet": "You don't have any works yet",
  "createNewWork": "Create New Work",
  "createFirstWork": "Create First Work",
  "Novo Trabalho": "New Work",
  "filterByStatus": "Filter by Status",
  "selectedStatus": "Selected Status",
  "clearFilter": "Clear Filter",
  "applyFilter": "Apply Filter", 
  "cancel": "Cancel"
};

const useTranslation = (language) => {
  const translations = {
    pt: ptTranslations,
    en: enTranslations
  };

  const t = (key, options = {}) => {
    const keys = key.split('.');
    let translation = translations[language];

    for (const k of keys) {
      translation = translation?.[k];
    }

    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    if (typeof translation === 'string' && options) {
      return translation.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return options[key] || match;
      });
    }

    return translation;
  };

  return { t };
};

// Status Filter Modal Component
const StatusFilterModal = ({ isOpen, onClose, selectedStatus, onStatusChange, language, t }) => {
  const statusOptions = ['Rascunho', 'Enviado', 'Retornado', 'Aprovado'];
  const [tempSelectedStatus, setTempSelectedStatus] = useState(selectedStatus);

  useEffect(() => {
    setTempSelectedStatus(selectedStatus);
  }, [selectedStatus, isOpen]);

  const handleApply = () => {
    onStatusChange(tempSelectedStatus);
    onClose();
  };

  const handleClear = () => {
    setTempSelectedStatus(null);
    onStatusChange(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{t('filterByStatus')}</h3>
          <button className="modal-close-button" onClick={onClose}>
            <X className="icon" />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="status-options">
            {statusOptions.map((status) => (
              <label key={status} className="status-option">
                <input
                  type="radio"
                  name="statusFilter"
                  value={status}
                  checked={tempSelectedStatus === status}
                  onChange={(e) => setTempSelectedStatus(e.target.value)}
                  className="status-radio"
                />
                <span className="status-label">{t(`statusTypes.${status}`)}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="modal-button secondary" onClick={onClose}>
            {t('cancel')}
          </button>
          <button className="modal-button secondary" onClick={handleClear}>
            {t('clearFilter')}
          </button>
          <button className="modal-button primary" onClick={handleApply}>
            {t('applyFilter')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Selected Status Component
const SelectedStatusComponent = ({ selectedStatus, onClear, language, t }) => {
  if (!selectedStatus) return null;

  return (
    <div className="selected-status-container">
      <span className="selected-status-label">{t('selectedStatus')}:</span>
      <div className="selected-status-badge">
        <span>{t(`statusTypes.${selectedStatus}`)}</span>
        <button className="clear-status-button" onClick={onClear}>
          <X className="icon-small" />
        </button>
      </div>
    </div>
  );
};

const MyWorks = () => {
  const [filtroTrabalhos, setFiltroTrabalhos] = useState('');
  const [showTrabalhosFilter, setShowTrabalhosFilter] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [language, setLanguage] = useState('pt');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const trabalhosPorPagina = 6;

  // Inline CSS para garantir que os estilos funcionem
  const styles = `
    .container {
      min-height: 100vh;
      background-color: #ffffff;
    }

    .main-content {
      max-width: 1152px;
      margin: 0 auto;
      padding: 1.5rem 1rem;
    }

    .filters-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    @media (min-width: 768px) {
      .filters-section {
        flex-direction: row;
      }
    }

    .filter-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background-color: #2c3e50;
      color: white;
      border: none;
      border-radius: 25px;
      transition: background-color 0.2s;
      font-size: 0.875rem;
      cursor: pointer;
    }

    @media (min-width: 768px) {
      .filter-button {
        font-size: 1rem;
      }
    }

    .filter-button:hover {
      background-color: #1a252f;
    }

    .icon {
      width: 1rem;
      height: 1rem;
    }

    .icon-small {
      width: 0.75rem;
      height: 0.75rem;
    }

    .chevron {
      transition: transform 0.2s;
    }

    .chevron.rotated {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 0.5rem;
      width: 14rem;
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      z-index: 20;
      max-height: 20rem;
      overflow-y: auto;
    }

    .dropdown-item {
      width: 100%;
      padding: 0.75rem 1rem;
      text-align: left;
      transition: background-color 0.2s;
      font-size: 0.875rem;
      background: none;
      border: none;
      cursor: pointer;
    }

    .dropdown-item:hover {
      background-color: #f9fafb;
    }

    .dropdown-item.all-items {
      font-weight: 500;
      color: #4a7c59;
      border-bottom: 1px solid #f3f4f6;
    }

    .dropdown-group-header {
      padding: 0.5rem 1rem;
      background-color: #f9fafb;
      font-size: 0.75rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #f3f4f6;
    }

    .new-work-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background-color: #4a7c59;
      color: white;
      border: none;
      border-radius: 25px;
      transition: background-color 0.2s;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
    }

    @media (min-width: 768px) {
      .new-work-button {
        font-size: 1rem;
      }
    }

    .new-work-button:hover {
      background-color: #3d6249;
    }

    .results-pagination {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    @media (min-width: 640px) {
      .results-pagination {
        flex-direction: row;
        align-items: center;
      }
    }

    .results-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #111827;
    }

    @media (min-width: 768px) {
      .results-title {
        font-size: 1.875rem;
      }
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .pagination-info {
      font-size: 0.875rem;
      color: #6b7280;
      margin-right: 0.5rem;
    }

    .pagination-button {
      padding: 0.5rem;
      border: none;
      border-radius: 50%;
      transition: background-color 0.2s;
      cursor: pointer;
    }

    .filter-dropdown {
      position: relative;
    }

    .pagination-button.enabled {
      background-color: #4a7c59;
      color: white;
    }

    .pagination-button.enabled:hover {
      background-color: #3d6249;
    }

    .pagination-button.disabled {
      background-color: #e5e7eb;
      color: #9ca3af;
      cursor: not-allowed;
    }

    .trabalhos-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    @media (min-width: 768px) {
      .trabalhos-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .trabalhos-grid {
        grid-template-columns: repeat(3, 1fr);
      }
      .modal-content {
        max-width: 500px;
      }
      .filters-section {
        align-items: center;
      }
    }

    .trabalho-card {
      background-color: #f8f9fa;
      border-radius: 15px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 3px solid #4a7c59;
      overflow: hidden;
      transition: box-shadow 0.2s;
      margin-bottom: 1rem;
    }

    .trabalho-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .card-content {
      padding: 1.5rem;
    }

    .image-placeholder {
      background-color: #e9ecef;
      border-radius: 8px;
      height: 8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .image-text {
      color: #6c757d;
      font-weight: 400;
      font-size: 0.875rem;
    }

    .status-container {
      margin-bottom: 0.75rem;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-aprovado {
      background-color: #dcfce7;
      color: #166534;
    }

    .status-enviado {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .status-rascunho {
      background-color: #f3f4f6;
      color: #374151;
    }

    .status-rejeitado {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .status-retornado {
      background-color: #fef3c7;
      color: #92400e;
    }

    .status-default {
      background-color: #f3f4f6;
      color: #374151;
    }

    .trabalho-title {
      font-size: 1.125rem;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 0.75rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .trabalho-description {
      color: #6c757d;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .trabalho-meta {
      font-size: 0.75rem;
      color: #6c757d;
      margin-bottom: 1rem;
    }

    .trabalho-meta > div {
      margin-bottom: 0.25rem;
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .categoria-tag {
      padding: 0.375rem 0.75rem;
      background-color: #e3f2fd;
      color: #1565c0;
      border-radius: 15px;
      font-size: 0.75rem;
      font-weight: 500;
      border: 1px solid #bbdefb;
    }

    .tag {
      padding: 0.375rem 0.75rem;
      background-color: #f5f5f5;
      color: #424242;
      border-radius: 15px;
      font-size: 0.75rem;
      border: 1px solid #e0e0e0;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 0;
    }

    .empty-icon {
      color: #9ca3af;
      margin-bottom: 1.5rem;
    }

    .search-icon {
      width: 4rem;
      height: 4rem;
      margin: 0 auto;
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 0.75rem;
    }

    .empty-description {
      color: #6b7280;
      margin-bottom: 2rem;
      max-width: 28rem;
      margin-left: auto;
      margin-right: auto;
    }

    .empty-action-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background-color: #4a7c59;
      color: white;
      border: none;
      border-radius: 25px;
      transition: background-color 0.2s;
      font-weight: 500;
      cursor: pointer;
    }

    .empty-action-button:hover {
      background-color: #3d6249;
    }

    .language-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background-color: #6b7280;
      color: white;
      border: none;
      border-radius: 20px;
      transition: background-color 0.2s;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .language-button:hover {
      background-color: #4b5563;
    }

    .status-filter-section {
      margin-bottom: 1rem;
    }

    .status-filter-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background-color: #4a7c59;
      color: white;
      border: none;
      border-radius: 25px;
      transition: background-color 0.2s;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
    }

    .status-filter-button:hover {
      background-color: #3d6249;
    }

    .selected-status-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background-color: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .selected-status-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #495057;
    }

    .selected-status-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      background-color: #e3f2fd;
      color: #1565c0;
      border-radius: 15px;
      font-size: 0.75rem;
      font-weight: 500;
      border: 1px solid #bbdefb;
    }

    .clear-status-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.125rem;
      background-color: transparent;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .clear-status-button:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      width: 100%;
      max-width: 400px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem 1.5rem 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .modal-close-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      background-color: transparent;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: background-color 0.2s;
      color: #6b7280;
    }

    .modal-close-button:hover {
      background-color: #f3f4f6;
      color: #374151;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .status-options {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .status-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .status-option:hover {
      background-color: #f9fafb;
    }

    .status-radio {
      width: 1rem;
      height: 1rem;
      border: 2px solid #d1d5db;
      border-radius: 50%;
      cursor: pointer;
      accent-color: #4a7c59;
    }

    .status-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      cursor: pointer;
    }

    .modal-footer {
      display: flex;
      gap: 0.75rem;
      padding: 1rem 1.5rem 1.5rem 1.5rem;
      border-top: 1px solid #e5e7eb;
      justify-content: flex-end;
    }

    .modal-button {
      padding: 0.625rem 1.25rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;
    }

    .modal-button.primary {
      background-color: #4a7c59;
      color: white;
      border-color: #4a7c59;
    }

    .modal-button.primary:hover {
      background-color: #3d6249;
      border-color: #3d6249;
    }

    .modal-button.secondary {
      background-color: white;
      color: #374151;
      border-color: #d1d5db;
    }

    .modal-button.secondary:hover {
      background-color: #f9fafb;
      border-color: #9ca3af;
    }
  `;

  const { t } = useTranslation(language);

  const usuarioLogado = {
    id: 1,
    nome: "Pedro",
    email: "pedro@estudante.ifpr.edu.br"
  };

  const todosTrabalhos = [
    {
      id: 1,
      titulo: {
        pt: "Desenvolvimento de Sistema Web para Gestão Acadêmica",
        en: "Web System Development for Academic Management"
      },
      descricao: {
        pt: "Projeto focado no desenvolvimento de uma aplicação web moderna utilizando React e Node.js para gestão de dados acadêmicos, com foco em usabilidade e performance.",
        en: "Project focused on developing a modern web application using React and Node.js for academic data management, focusing on usability and performance."
      },
      autores: [
        { nome: "Pedro Silva", email: "pedro@estudante.ifpr.edu.br" },
        { nome: "Maria Santos", email: "maria@estudante.ifpr.edu.br" }
      ],
      data: "14 Jan, 2024",
      categoria: "Artigo",
      status: "Aprovado",
      tags: {
        pt: ["Desenvolvimento de Software", "React", "Node.js"],
        en: ["Software Development", "React", "Node.js"]
      },
      imagem: "/api/placeholder/300/200"
    },
    {
      id: 2,
      titulo: {
        pt: "Análise de Algoritmos de Machine Learning Aplicados à Educação",
        en: "Analysis of Machine Learning Algorithms Applied to Education"
      },
      descricao: {
        pt: "Estudo comparativo entre diferentes algoritmos de aprendizado de máquina aplicados à análise de dados educacionais para predição de desempenho acadêmico.",
        en: "Comparative study between different machine learning algorithms applied to educational data analysis for academic performance prediction."
      },
      autores: [
        { nome: "Pedro Silva", email: "pedro@estudante.ifpr.edu.br" },
        { nome: "Ana Costa", email: "ana@estudante.ifpr.edu.br" }
      ],
      data: "28 Feb, 2024",
      categoria: "TCC",
      status: "Enviado",
      tags: {
        pt: ["Machine Learning", "Análise de Dados", "Python"],
        en: ["Machine Learning", "Data Analysis", "Python"]
      },
      imagem: "/api/placeholder/300/200"
    },
    {
      id: 3,
      titulo: {
        pt: "Internet das Coisas na Educação: Monitoramento Inteligente",
        en: "Internet of Things in Education: Smart Monitoring"
      },
      descricao: {
        pt: "Implementação de soluções IoT para monitoramento e automação de ambientes educacionais, criando salas de aula inteligentes e interativas.",
        en: "Implementation of IoT solutions for monitoring and automation of educational environments, creating smart and interactive classrooms."
      },
      autores: [
        { nome: "Pedro Silva", email: "pedro@estudante.ifpr.edu.br" }
      ],
      data: "15 Mar, 2024",
      categoria: "Projeto",
      status: "Rascunho",
      tags: {
        pt: ["IoT", "Arduino", "Sensores"],
        en: ["IoT", "Arduino", "Sensors"]
      },
      imagem: "/api/placeholder/300/200"
    },
    {
      id: 4,
      titulo: {
        pt: "Aplicativo Mobile para Controle de Frequência",
        en: "Mobile App for Attendance Control"
      },
      descricao: {
        pt: "Desenvolvimento de aplicativo móvel para controle automatizado de frequência estudantil utilizando tecnologias de reconhecimento facial.",
        en: "Development of mobile application for automated student attendance control using facial recognition technologies."
      },
      autores: [
        { nome: "Pedro Silva", email: "pedro@estudante.ifpr.edu.br" },
        { nome: "Carlos Lima", email: "carlos@estudante.ifpr.edu.br" }
      ],
      data: "10 Apr, 2024",
      categoria: "Artigo",
      status: "Retornado",
      tags: {
        pt: ["Mobile", "React Native", "IA"],
        en: ["Mobile", "React Native", "AI"]
      },
      imagem: "/api/placeholder/300/200"
    },
    {
      id: 5,
      titulo: {
        pt: "Sistema de Blockchain para Certificação Acadêmica",
        en: "Blockchain System for Academic Certification"
      },
      descricao: {
        pt: "Proposta de sistema descentralizado usando blockchain para emissão e validação de certificados acadêmicos, garantindo autenticidade e segurança.",
        en: "Proposal for a decentralized system using blockchain for issuing and validating academic certificates, ensuring authenticity and security."
      },
      autores: [
        { nome: "Pedro Silva", email: "pedro@estudante.ifpr.edu.br" }
      ],
      data: "25 May, 2024",
      categoria: "Dissertação",
      status: "Aprovado",
      tags: {
        pt: ["Blockchain", "Certificação", "Segurança"],
        en: ["Blockchain", "Certification", "Security"]
      },
      imagem: "/api/placeholder/300/200"
    }
  ];

  const trabalhos = todosTrabalhos.filter(trabalho =>
    trabalho.autores.some(autor => autor.email === usuarioLogado.email)
  );

  const statusOptions = ['Rascunho', 'Enviado', 'Retornado', 'Aprovado'];
  const categoriaOptions = ['Artigo', 'TCC', 'Projeto', 'Dissertação', 'Tese'];

  const todasOpcoesFiltro = [
    { tipo: 'categoria', label: t('category'), opcoes: categoriaOptions },
    { tipo: 'status', label: t('status'), opcoes: statusOptions }
  ];

  // Load status filter from memory on component mount
  useEffect(() => {
    const savedFilter = JSON.parse(localStorage.getItem('statusFilter') || 'null');
    if (savedFilter && statusOptions.includes(savedFilter)) {
      setSelectedStatus(savedFilter);
    }
  }, []);

  // Save status filter to memory when it changes
  useEffect(() => {
    localStorage.setItem('statusFilter', JSON.stringify(selectedStatus));
  }, [selectedStatus]);

  const trabalhosFiltrados = trabalhos.filter(trabalho => {
    // Apply status filter first
    if (selectedStatus && trabalho.status !== selectedStatus) {
      return false;
    }

    // Then apply text/category filters
    if (!filtroTrabalhos) return true;

    if (statusOptions.includes(filtroTrabalhos)) {
      return trabalho.status === filtroTrabalhos;
    }

    if (categoriaOptions.includes(filtroTrabalhos)) {
      return trabalho.categoria === filtroTrabalhos;
    }

    return trabalho.titulo[language].toLowerCase().includes(filtroTrabalhos.toLowerCase()) ||
      trabalho.tags[language].some(tag => tag.toLowerCase().includes(filtroTrabalhos.toLowerCase()));
  });

  const totalPaginas = Math.ceil(trabalhosFiltrados.length / trabalhosPorPagina);
  const indiceInicio = (paginaAtual - 1) * trabalhosPorPagina;
  const indiceFim = indiceInicio + trabalhosPorPagina;
  const trabalhosPaginaAtual = trabalhosFiltrados.slice(indiceInicio, indiceFim);

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroTrabalhos, selectedStatus]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-dropdown')) {
        setShowTrabalhosFilter(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleNovoTrabalho = () => {
    alert(t('myWorks.redirectingToCreate') || 'Redirecionando para criar novo trabalho...');
  };

  const handlePaginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  const handleProximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Aprovado': return 'status-aprovado';
      case 'Enviado': return 'status-enviado';
      case 'Rascunho': return 'status-rascunho';
      case 'Retornado': return 'status-retornado';
      default: return 'status-default';
    }
  };

  const getFiltroTexto = () => {
    if (!filtroTrabalhos) return 'Filtrar trabalhos';

    if (statusOptions.includes(filtroTrabalhos)) {
      return t(`statusTypes.${filtroTrabalhos}`);
    }
    if (categoriaOptions.includes(filtroTrabalhos)) {
      return t(`workTypes.${filtroTrabalhos}`);
    }

    return filtroTrabalhos;
  };

  const toggleLanguage = () => {
    setLanguage(language === 'pt' ? 'en' : 'pt');
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  const clearStatusFilter = () => {
    setSelectedStatus(null);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="container">
      <div className="main-content">
        {/* Header with Language Toggle */}
        <div className="filters-section" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="results-title">{t('Meus Trabalhos')}</h1>
          <button onClick={toggleLanguage} className="language-button">
            <Globe className="icon" />
            {language.toUpperCase()}
          </button>
        </div>

        {/* Status Filter Button */}
        <div className="status-filter-section">
          <button 
            className="status-filter-button"
            onClick={() => setIsStatusModalOpen(true)}
          >
            <Filter className="icon" />
            {t('filterByStatus')}
          </button>
        </div>

        {/* Selected Status Display */}
        <SelectedStatusComponent 
          selectedStatus={selectedStatus}
          onClear={clearStatusFilter}
          language={language}
          t={t}
        />

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-dropdown">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTrabalhosFilter(!showTrabalhosFilter);
              }}
              className="filter-button"
            >
              <Filter className="icon" />
              <span>{getFiltroTexto()}</span>
              <ChevronDown className={`icon chevron ${showTrabalhosFilter ? 'rotated' : ''}`} />
            </button>

            {showTrabalhosFilter && (
              <div className="dropdown-menu">
                <button
                  onClick={() => {
                    setFiltroTrabalhos('');
                    setShowTrabalhosFilter(false);
                  }}
                  className="dropdown-item all-items"
                >
                  {t('allWorks')}
                </button>

                {todasOpcoesFiltro.map((grupo) => (
                  <div key={grupo.tipo}>
                    <div className="dropdown-group-header">
                      {grupo.label}
                    </div>
                    {grupo.opcoes.map((opcao) => (
                      <button
                        key={opcao}
                        onClick={() => {
                          setFiltroTrabalhos(opcao);
                          setShowTrabalhosFilter(false);
                        }}
                        className="dropdown-item"
                      >
                        {grupo.tipo === 'status' ? t(`statusTypes.${opcao}`) : t(`workTypes.${opcao}`)}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleNovoTrabalho}
            className="new-work-button"
          >
            <Plus className="icon" />
            {t('Novo Trabalho')}
          </button>
        </div>

        {/* Results and Pagination */}
        <div className="results-pagination">
          <h2 className="results-title">
            {trabalhosFiltrados.length} {trabalhosFiltrados.length === 1 ? t('results') : t('resultados')}
          </h2>

          {totalPaginas > 1 && (
            <div className="pagination-controls">
              <span className="pagination-info">
                {t('page')} {paginaAtual} {t('of')} {totalPaginas}
              </span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  onClick={handlePaginaAnterior}
                  disabled={paginaAtual === 1}
                  className={`pagination-button ${paginaAtual === 1 ? 'disabled' : 'enabled'}`}
                >
                  <ChevronLeft className="icon" />
                </button>
                <button
                  onClick={handleProximaPagina}
                  disabled={paginaAtual === totalPaginas}
                  className={`pagination-button ${paginaAtual === totalPaginas ? 'disabled' : 'enabled'}`}
                >
                  <ChevronRight className="icon" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Works Grid */}
        {trabalhosPaginaAtual.length > 0 ? (
          <div className="trabalhos-grid">
            {trabalhosPaginaAtual.map((trabalho) => (
              <div key={trabalho.id} className="trabalho-card">
                <div className="card-content">
                  <div className="image-placeholder">
                    <span className="image-text">{t('imageText')}</span>
                  </div>

                  <div className="status-container">
                    <span className={`status-badge ${getStatusColor(trabalho.status)}`}>
                      {t(`statusTypes.${trabalho.status}`)}
                    </span>
                  </div>

                  <h3 className="trabalho-title">
                    {trabalho.titulo[language]}
                  </h3>

                  <p className="trabalho-description">
                    {trabalho.descricao[language]}
                  </p>

                  <div className="trabalho-meta">
                    <div><strong>{t('authors')}:</strong> {trabalho.autores.map(a => a.nome).join(', ')}</div>
                    <div><strong>{t('date')}:</strong> {trabalho.data}</div>
                  </div>

                  <div className="tags-container">
                    <span className="categoria-tag">
                      {t(`workTypes.${trabalho.categoria}`)}
                    </span>
                    {trabalho.tags[language].slice(0, 2).map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                    {trabalho.tags[language].length > 2 && (
                      <span className="tag">
                        +{trabalho.tags[language].length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="image-placeholder empty-icon">
              <Search className="search-icon" />
            </div>
            <h3 className="empty-title">{t('noWorksFound')}</h3>
            <p className="empty-description">
              {filtroTrabalhos || selectedStatus ? t('noWorksFoundDesc') : t('noWorksYet')}
            </p>
            <button
              onClick={handleNovoTrabalho}
              className="empty-action-button"
            >
              <Plus className="icon" />
              {filtroTrabalhos || selectedStatus ? t('createNewWork') : t('createFirstWork')}
            </button>
          </div>
        )}

        {/* Status Filter Modal */}
        <StatusFilterModal 
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          language={language}
          t={t}
        />
      </div>
    </>
  );
};

export default MyWorks;
