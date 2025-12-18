/**
 * ZincContentParser.ts
 * Restructures Wikipedia HTML into distinct "Briefing" and "Data Module" blocks.
 */

export const parseWikiContent = (rawHtml: string): string => {
    if (typeof window === 'undefined') return rawHtml; 
  
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');
  
    // --- 0. FLATTEN STRUCTURE ---
    // Wikipedia often wraps content in a div.mw-parser-output. 
    // We need to unwrap this to find the H2 headers at the top level.
    let rootElement = doc.body;
    const parserOutput = doc.querySelector('.mw-parser-output');
    if (parserOutput) {
        // If we find the standard wiki wrapper, use its children directly
        // This is crucial to finding the H2 tags for sectioning
        const fragment = doc.createDocumentFragment();
        while (parserOutput.firstChild) {
            fragment.appendChild(parserOutput.firstChild);
        }
        doc.body.innerHTML = '';
        doc.body.appendChild(fragment);
    } 

    // Also unwrap generic single-child divs if they exist
    while (doc.body.children.length === 1 && doc.body.children[0].tagName === 'DIV') {
        const wrapper = doc.body.children[0];
        const fragment = doc.createDocumentFragment();
        while (wrapper.firstChild) {
            fragment.appendChild(wrapper.firstChild);
        }
        doc.body.innerHTML = '';
        doc.body.appendChild(fragment);
    }

    // --- 1. CLEANUP CLUTTER ---
    const selectorsToRemove = [
      '.mw-editsection', '.reference', '.reflist', '.box-More_citations_needed', 
      '.hatnote', '.shortdescription', '.ambox', '.navbox', '.sidebar', 
      '.gallery', 'style', 'script', '.mw-empty-elt', '.noprint', '.portal',
      '.sister-link', '.box-Update'
    ];
  
    selectorsToRemove.forEach(selector => {
      doc.querySelectorAll(selector).forEach(el => el.remove());
    });
  
    // --- 2. NEUTRALIZE LINKS & MEDIA ---
    doc.querySelectorAll('a').forEach(a => {
        // Keep the text, remove the link functionality but style it as a reference
        a.removeAttribute('href');
        a.removeAttribute('title');
        a.classList.add('zinc-ref-link');
    });

    doc.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (src && src.startsWith('//')) {
        img.setAttribute('src', `https:${src}`);
      }
      img.removeAttribute('width');
      img.removeAttribute('height');
      img.removeAttribute('srcset'); // Remove srcset to prevent loading massive images
    });
  
    // --- 3. RESTRUCTURE IMAGES TO FIGURES ---
    doc.querySelectorAll('.thumb').forEach(thumb => {
        const img = thumb.querySelector('img');
        const caption = thumb.querySelector('.thumbcaption');
        if (img) {
            const figure = doc.createElement('figure');
            figure.className = 'zinc-figure';
            figure.appendChild(img.cloneNode(true));
            if (caption) {
                const figcaption = doc.createElement('figcaption');
                figcaption.className = 'zinc-figcaption';
                figcaption.innerHTML = caption.innerHTML;
                figure.appendChild(figcaption);
            }
            thumb.parentNode?.replaceChild(figure, thumb);
        } else {
            thumb.remove(); 
        }
    });

    // --- 4. FORMAT TABLES ---
    doc.querySelectorAll('table').forEach(table => {
        table.removeAttribute('style'); 
        table.removeAttribute('width');
        table.removeAttribute('align');
        table.removeAttribute('bgcolor');
        
        if (table.classList.contains('infobox')) {
            table.classList.add('zinc-infobox');
        } else {
            table.classList.add('zinc-table');
            const wrapper = doc.createElement('div');
            wrapper.className = 'zinc-table-wrapper';
            table.parentNode?.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });

    // --- 5. THE MODULAR RESTRUCTURE ---
    const mainContainer = doc.createElement('div');
    const nodes = Array.from(doc.body.childNodes);
    
    // Container 1: The "Mission Briefing" (Intro)
    const introSection = doc.createElement('div');
    introSection.className = 'zinc-briefing-module';
    
    // Container 2: The "Archives" (Accordions)
    const archivesContainer = doc.createElement('div');
    archivesContainer.className = 'zinc-archives-container space-y-4'; // Add spacing

    let activeContainer: HTMLElement = introSection; 
    
    let currentDetails: HTMLElement | null = null;
    let currentContent: HTMLElement | null = null;

    // Use for...of loop to avoid TypeScript closure scope issues
    for (const node of nodes) {
        // DETECT SECTION HEADERS (H2)
        if (node.nodeName === 'H2') {
            // Close previous module if open
            if (currentDetails && currentContent) {
                currentDetails.appendChild(currentContent);
                archivesContainer.appendChild(currentDetails);
            }

            // Start New "File Module"
            currentDetails = doc.createElement('details');
            currentDetails.className = 'zinc-file-module group'; 

            // Create The Header (Summary)
            const summary = doc.createElement('summary');
            summary.className = 'zinc-file-header';
            
            const title = node.textContent?.replace(/\[edit\]/g, '') || 'Encrypted Section';
            
            summary.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="zinc-file-icon-wrapper">
                        <div class="zinc-file-icon"></div>
                    </div>
                    <span class="zinc-file-title">${title}</span>
                </div>
                <div class="zinc-file-indicator">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 9l6 6 6-6"/>
                    </svg>
                </div>
            `;
            
            currentDetails.appendChild(summary);
            
            // Create The Body Content
            currentContent = doc.createElement('div');
            currentContent.className = 'zinc-file-body';

            // Switch active container to this new module
            activeContainer = currentContent;
        } 
        // IF H3 (Sub-headers), style them but keep inside current module
        else if (node.nodeName === 'H3') {
             const subHeader = doc.createElement('h3');
             subHeader.className = 'zinc-sub-header';
             subHeader.textContent = node.textContent?.replace(/\[edit\]/g, '') || '';
             activeContainer.appendChild(subHeader);
        }
        else {
            // Append content to active container
            // Filter out empty text nodes to keep DOM clean
            if (node.nodeType === 3 && !node.textContent?.trim()) continue;
            activeContainer.appendChild(node.cloneNode(true));
        }
    }

    // Append the final hanging module
    if (currentDetails && currentContent) {
        currentDetails.appendChild(currentContent);
        archivesContainer.appendChild(currentDetails);
    }

    // ASSEMBLE FINAL DOM
    // 1. Briefing Label
    const briefingLabel = doc.createElement('div');
    briefingLabel.className = 'zinc-label';
    briefingLabel.innerHTML = '/// MISSION BRIEFING <span class="zinc-hash">:: 001</span>';
    mainContainer.appendChild(briefingLabel);

    // 2. Briefing Content
    mainContainer.appendChild(introSection);

    // 3. Archives Label (if exists)
    if (archivesContainer.hasChildNodes()) {
        const archivesLabel = doc.createElement('div');
        archivesLabel.className = 'zinc-label mt-12 mb-6';
        archivesLabel.innerHTML = '/// CLASSIFIED ARCHIVES <span class="zinc-hash">:: ACCESS GRANTED</span>';
        mainContainer.appendChild(archivesLabel);
        mainContainer.appendChild(archivesContainer);
    }

    return mainContainer.innerHTML;
};