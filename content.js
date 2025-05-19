chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Message received:", request);
    
    if (request.action === "getAverages") {
      try {
      
        const averages = calculateAverages();
        
        chrome.storage.local.set({ 'lastCalculatedAverages': averages }, function() {
          console.log("Averages saved to storage");
        });
        
        sendResponse({ averages: averages });
      } catch (error) {
        console.error("Error calculating averages:", error);
        sendResponse({ error: error.message });
      }
    }
    
    return true; 
  });
  
  function calculateAverages() {
    try {
  
  
      const activeTab = document.querySelector('.tab-pane[aria-expanded="true"], .tab-pane.active');
      if (!activeTab) {
        return {
          sectionAverages: { "No Active Tab": "No active tab found" },
          grandAvg: "No active tab"
        };
      }
  
      const course=activeTab.querySelector("h5").textContent
      const cards = activeTab.querySelectorAll('.card');
      let allData = {};
      let totalAvgScoreSum = 0;
      let totalObtainedScoreSum = 0;
      let totalWeightSum = 0;
      
      cards.forEach((card, cardIndex) => {
  
        const header = card.querySelector('.card-header');
        const cardId = header ? header.id || `Card-${cardIndex}` : `Card-${cardIndex}`;
        
  
        const cardBody = card.querySelector('.card-body');
        if (!cardBody) return;
        
        const table = cardBody.querySelector('table');
        if (!table) return;
  
        const titleRow = table.querySelector('.titlerow');
        let headers = [];
        if (titleRow) {
          const headerCells = titleRow.querySelectorAll('.text-center');
          headers = Array.from(headerCells).map(cell => cell.textContent.trim());
        }
        
        
        const calculationRows = table.querySelectorAll('.calculationrow');
        let rowsData = [];
        let totalScoreSum = 0;
        
        calculationRows.forEach((row, rowIndex) => {
          try {
            const avgEl = row.querySelector('.text-center.AverageMarks');
            const totalEl = row.querySelector('.text-center.GrandTotal');
            const weightEl = row.querySelector('.text-center.weightage');
        
            if (!avgEl || !totalEl || !weightEl) return;
        
            const avg = parseFloat(avgEl.textContent.trim()) || 0;
            const total = parseFloat(totalEl.textContent.trim()) || 1; 
            const weight = parseFloat(weightEl.textContent.trim()) || 0;
        
            const score = (avg / total) * weight;
            totalScoreSum += score;
        
            rowsData.push(`Row ${rowIndex + 1}: Score = ${score.toFixed(2)}`);
   
        
          } catch (e) {
            console.error(`Error in row ${rowIndex + 1}:`, e);
          }
        });
        
       
        const finalScore = totalScoreSum.toFixed(2);
        const targetobtainedmarksCell = table.querySelector('td.text-center.totalColObtMarks');
        const targetCell = table.querySelector('td.text-center.totalColAverageMarks');
        const targetWeightageCell = table.querySelector('td.text-center.totalColweightage');
        
  
  
        const obtainedMarks = parseFloat(targetobtainedmarksCell?.textContent.trim()) || 0;
        const averageMarks = parseFloat(targetCell?.textContent.trim()) || 0;
        const weightage = parseFloat(targetWeightageCell?.textContent.trim()) || 0;
        
        totalAvgScoreSum += averageMarks;
        totalObtainedScoreSum += obtainedMarks;
        totalWeightSum += weightage;
        
      
  
         if (targetCell) {
                targetCell.textContent = finalScore;
                targetCell.style.fontWeight = 'bold'; 
                targetCell.style.color = 'blue';      
            }
  
      
      });
  
  
        
      let sectionAverages = {};
      
      sectionAverages["Total Weightage"] = totalWeightSum.toFixed(5);
      sectionAverages["Obtained "] = totalObtainedScoreSum.toFixed(5);
      sectionAverages["Class Average "] = totalAvgScoreSum.toFixed(5);
      
         
      return {
        sectionAverages,
        sectionName: course
      };
      
    } catch (error) {
      console.error("Error retrieving data:", error);
      return {
        sectionAverages: { "Error": error.message },
        grandAvg: "Error occurred"
      };
    }
  }
  
  
  
  let keepAliveInterval = setInterval(function() {
    console.log("Extension content script is active");
  }, 20000);
  
  
  window.addEventListener('unload', function() {
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
    }
  });