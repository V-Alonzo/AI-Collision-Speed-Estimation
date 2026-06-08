%% Clase adaptada para el manuscrito del proyecto CESVI
%% Versión limpia: español por defecto, inglés opción secundaria

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{SpeedEstimationAI_paper}[2026-05-20 paper class]

% Basic class options
\DeclareOption{11pt}{\OptionNotUsed}
\DeclareOption{12pt}{\OptionNotUsed}
\DeclareOption{onecolumn}{\OptionNotUsed}
\DeclareOption*{\PassOptionsToClass{\CurrentOption}{article}}
\newif\if@isblind\@isblindfalse
\DeclareOption{blind}{\@isblindtrue}

\newif\if@isopendata\@isopendatafalse
\DeclareOption{opendata}{\@isopendatatrue}
\newif\if@ispublished\@ispublishedfalse
\DeclareOption{published}{\@ispublishedtrue}

% Language options: esp (default) and eng
\newif\iflang@eng
\newif\iflang@esp
\def\lang@mutopterr{%
    \PackageError{lang}{Options 'eng' and 'esp' are mutually exclusive.}{}%
}%
\DeclareOption{eng}{%
    \iflang@esp\lang@mutopterr\fi
    \lang@engtrue\lang@espfalse
}
\DeclareOption{esp}{%
    \iflang@eng\lang@mutopterr\fi
    \lang@engfalse\lang@esptrue
}

\ProcessOptions\relax
\LoadClass[twoside,a4paper,10pt,twocolumn,english]{article}

% Default: Spanish
\iflang@eng
\else
  \iflang@esp
  \else
    \lang@esptrue\lang@engfalse
  \fi
\fi

% Packages
\usepackage[utf8]{inputenc}
\iflang@eng
  \usepackage[english]{babel}
\fi
\iflang@esp
  \usepackage[spanish,english]{babel}
\fi
\usepackage[T1]{fontenc}
\usepackage{ae,aecompl}
\usepackage{pslatex}
\usepackage[samesize]{cancel}
\usepackage{graphicx}
\usepackage{setspace}
\usepackage{amsmath}
\usepackage{amsfonts}
\usepackage{amssymb}
\usepackage{float}
\usepackage{makecell}
\usepackage{url}
\Urlmuskip=0mu plus 1mu
\usepackage{calc}
\usepackage{tabto}
\usepackage{lettrine}

\usepackage[bookmarks,bookmarksopen=true,bookmarksnumbered=true,breaklinks=true,colorlinks=true,linkcolor=black,urlcolor=black,citecolor=black,anchorcolor=green,hyperindex=true,hyperfigures]{hyperref}

\hyphenpenalty=5000
\tolerance=1000
\sloppy

% Page layout (kept similar to original)
\setlength{\hoffset}{-1in}
\setlength{\voffset}{-1in}
\setlength{\oddsidemargin}{2cm}
\setlength{\evensidemargin}{2cm}
\setlength{\topmargin}{0.7cm}
\setlength{\headheight}{1.2cm}
\setlength{\headsep}{0.4cm}
\setlength{\textheight}{25.7cm}
\setlength{\textwidth}{17.5cm}
\setlength{\footskip}{1.0cm}
\setlength{\columnsep}{0.5cm}

% Author/affiliation
\usepackage[noblocks]{authblk}
\renewcommand\AB@affilsepx{\protect\par\protect\Affilfont}
\iflang@eng
  \renewcommand\Authands{ and }
  \renewcommand\Authand{ and }
\fi
\iflang@esp
  \renewcommand\Authands{ y }
  \renewcommand\Authand{ y }
\fi
\renewcommand{\Affilfont}{\fontsize{9}{12}\selectfont\itshape}
\renewcommand{\Authfont}{\fontsize{12}{14}\selectfont}

% Metadata macros and safe defaults
\def\thisvolume#1{\gdef\@thevolume{1}}
\def\thisnumber#1{\gdef\@thenumber{1}}
\def\thismonth#1{\gdef\@themonth{Junio}}
\def\thisyear#1{\gdef\@theyear{2026}}
\def\receptiondate#1{\gdef\@receptiondate{#1}}
\def\acceptancedate#1{\gdef\@acceptancedate{#1}}
\def\publicationdate#1{\gdef\@publicationdate{#1}}
\def\abstract#1{\gdef\@englishabstract{#1}}
\def\keywords#1{\gdef\@englishkeywords{#1}}
\def\resumen#1{\gdef\@spanishabstract{#1}}
\def\palabrasclave#1{\gdef\@spanishkeywords{#1}}
\gdef\@receptiondate{}
\gdef\@acceptancedate{}
\gdef\@publicationdate{}
\gdef\@englishabstract{}
\gdef\@englishkeywords{}
\gdef\@spanishabstract{}
\gdef\@spanishkeywords{}
\def\datadoi#1{\gdef\@doi{#1}}\datadoi{}
\def\data#1{\gdef\@data{#1}}\data{}
\def\publishedat#1{\gdef\@publi{#1}}\publishedat{}

% Contact data
\def\contactauthor#1{\gdef\@thecontactauthor{#1}}
\def\email#1{\gdef\@theemail{#1}}
\newcommand*{\contacto}{%
  \if@isblind
    \iflang@eng Version for reviewers.\fi
    \iflang@esp Versión para revisores.\fi
  \else
    \iflang@eng \@thecontactauthor, \@theemail\fi
    \iflang@esp \@thecontactauthor, \@theemail\fi
  \fi
}
\renewcommand*\footnoterule{}
\newcommand\blfootnote[1]{\begingroup\renewcommand\thefootnote{}\footnote{#1}\addtocounter{footnote}{-1}\endgroup}

\newcommand*{\printcontactdata}{%
  \blfootnote{\\{\fontsize{8}{11}\selectfont
    \if@isopendata \href{\@data}{\includegraphics{opendata}} \\
    \fi
    \ifx\@doi\@empty\else DOI: \href{https://doi.org/\@doi}{\@doi} \\\fi
    \if@ispublished
      \ifx\@publi\@empty\else
        \iflang@eng This is a revised version of a preliminary conference paper that was presented in \@publi \\\fi
        \iflang@esp Esta es una versión revisada de un artículo de conferencia presentado en \@publi \\\fi
      \fi
    \fi
    \iflang@eng Contact data:\fi
    \iflang@esp Datos de contacto:\fi
    \contacto}}
}

% Title/author helpers
\def\title#1{\gdef\@title{#1}\gdef\thetitle{#1}}
\def\titulo#1{\gdef\@titulo{#1}}
\def\shorttitle#1{\gdef\@theshorttitle{#1}}
\def\firstauthor#1{\gdef\@thefirstauthor{#1}}
\providecommand{\@title}{}
\providecommand{\@titulo}{}
\providecommand{\@author}{}
\providecommand{\@theshorttitle}{}
\providecommand{\@thefirstauthor}{}
\providecommand{\@thecontactauthor}{}
\providecommand{\@theemail}{}
\newcommand*{\authorheader}{% simple author header helper
  \begingroup
  \ifnum\value{authors}<4
    \if@isblind \iflang@eng AUTHOR\fi \iflang@esp AUTOR\fi
    \else \MakeUppercase{\@thefirstauthor}\fi
  \else
    \if@isblind \iflang@eng 1st. AUTHOR~{\itshape et al.}\fi \iflang@esp 1er. AUTOR~{\itshape et al.}\fi
    \else {\MakeUppercase{\@thefirstauthor}~{\itshape et al.}}\fi
  \fi
  \endgroup}

% Helper macros used by the manuscript
\newcommand{\vcenteredinclude}[1]{\begingroup\setbox0=\hbox{\includegraphics[height=\headheight]{#1}}\parbox{\wd0}{\box0}\endgroup}
\renewcommand\theadalign{cc}
\renewcommand\theadgape{\Gape[4pt]}
\renewcommand\cellgape{\Gape[4pt]}

% Captions
\usepackage{caption}
\captionsetup[figure]{font=small,labelfont=bf,justification=centering}
\captionsetup[figure]{name=Fig.}
\DeclareCaptionFormat{myformat}{#1#2#3}
\captionsetup[figure]{format=myformat}
\captionsetup[table]{font={small,sc},labelfont={bf,sc},justification=centering}
\iflang@eng \captionsetup[table]{name=Table}\fi
\iflang@esp \captionsetup[table]{name=Tabla}\captionsetup[figure]{name=Figura}\fi

% Make title: print Spanish primary and English secondary when available
\newcommand*\varhrulefill[1][0.4pt]{\leavevmode\leaders\hrule height#1\hfill\kern0pt}
\renewcommand{\@maketitle}{%
  \newpage\null\onecolumn\begingroup
    {\begin{center}
      \noindent\varhrulefill[0.25mm] \par
      \iflang@esp
        \ifx\@titulo\@empty
          {\fontsize{30}{34}\selectfont \@title \par}
        \else
          {\fontsize{30}{34}\selectfont \@titulo \par}
          \vspace{0.3cm}{\fontsize{14}{16}\selectfont \@title\par}
        \fi
      \fi
      \iflang@eng {\fontsize{30}{34}\selectfont \@title \par}\fi
      \noindent\varhrulefill[0.25mm] \par
      \vspace{0.3cm}
      {\setlength{\tabcolsep}{0in}\begin{tabular}[c]{c}
        \if@isblind
          \iflang@eng {\fontsize{12}{14}\selectfont Version for reviewers.}\fi
          \iflang@esp {\fontsize{12}{14}\selectfont Versión para revisores.}\fi
        \else
          {\@author}
        \fi
      \end{tabular}}
      \vspace{0.2cm}
      \iflang@esp {\fontsize{8}{10}\selectfont Fecha de recepción: \@receptiondate \\ Fecha de aceptación: \@acceptancedate \\ Fecha de publicación: \@publicationdate} \fi
      \iflang@eng {\fontsize{8}{10}\selectfont Reception date: \@receptiondate \\ Acceptance date: \@acceptancedate \\ Publication date: \@publicationdate} \fi
    \end{center}}
    \noindent\varhrulefill[0.25mm]\par\vspace{0.4cm}
    \iflang@esp \noindent {\bfseries Resumen}---\@spanishabstract \par \vspace{0.3cm} \noindent {\bfseries Palabras clave}---\@spanishkeywords \par \vspace{0.3cm} \fi
    \iflang@eng \noindent {\bfseries Abstract}---\@englishabstract \par \vspace{0.3cm} \noindent {\bfseries Keywords}---\@englishkeywords \par \vspace{0.3cm} \fi
    \vspace{0.2cm}\noindent\varhrulefill[0.25mm]
  \twocolumn\endgroup}

% Footer/header
\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhf{}
\renewcommand{\headrulewidth}{0pt}
\fancyhead[LO]{\vcenteredinclude{tec_logo}}
\fancyhead[RO]{{\fontsize{7}{10}\selectfont ESCUELA DE INGENIERÍA Y CIENCIAS, VOL.~\@thevolume, NO.~\@thenumber, \@themonth~\@theyear}}
\fancyhead[CO]{ }
\fancyhead[LE]{ }
\fancyhead[CE]{{\fontsize{7}{10}\selectfont \MakeUppercase{\@theshorttitle}}}
\fancyhead[RE]{{\fontsize{7}{10}\selectfont \authorheader}}
\fancyfoot[LO,RE]{{\fontsize{9}{10}\selectfont ISSN: 2675-3588}}
\fancyfoot[CO,CE]{ }
\fancyfoot[RO,LE]{{\fontsize{7}{10}\selectfont \thepage}}

% Section Format Settings (match AJCEAM style)
\renewcommand{\@seccntformat}[1]{\csname the#1\endcsname.~}
\renewcommand*{\thesection}{\Roman{section}}
\renewcommand{\section}{\@startsection{section}{1}{0mm}%
                                     {-12pt}%
                                     {6pt}%
                                     {\setlength\parindent{0em} \fontsize{12}{14} \selectfont \bfseries\textsc}}%
\renewcommand \thesubsection{\alph{subsection}}
\renewcommand{\subsection}{\@startsection{subsection}{2}{0mm}%
                                     {-12pt}%
                                     {6pt}%
                                     {\setlength\parindent{0em} \fontsize{11}{13} \selectfont \bfseries\textit}}%
\renewcommand \thesubsubsection{\arabic{subsubsection}}
\renewcommand{\subsubsection}{\@startsection{subsubsection}{3}{0mm}%
                                     {-12pt}%
                                     {6pt}%
                                     {\setlength\parindent{0em} \fontsize{11}{13} \selectfont \textit}}

% Definitions for capital letter
\newcommand{\firstword}[2]{\lettrine[findent=2pt]{\textbf{#1}}{}#2}

% Bibliography naming
\newcommand{\insertbibliography}[1]{%
  {\setstretch{0.85}\fontsize{8}{10}\selectfont
    \iflang@eng \bibliographystyle{IEEETran}\renewcommand\refname{References}\fi
    \iflang@esp \bibliographystyle{IEEETran}\renewcommand\refname{Referencias}\fi
    \bibliography{#1}}
}

% End of class
