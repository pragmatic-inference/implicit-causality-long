PennController.ResetPrefix(null);
Header().log( "PROLIFIC_ID" , GetURLParameter("PROLIFIC_PID") );

// Add custom CSS for larger answer options
Header(
    newFunction("addCSS", function() {
        var style = document.createElement('style');
        style.innerHTML = `
            .Question-choice {
                font-size: 1.5em !important;
                padding: 0.5em 1em !important;
                margin: 0 1em !important;
            }
            .Question td {
                font-size: 1.5em !important;
                padding: 0.5em 1em !important;
            }
            .Question-answer {
                font-size: 3em !important;
                padding: 1em 2em !important;
                border: 2px solid #ccc !important;
                border-radius: 8px !important;
            }
        `;
        document.head.appendChild(style);
    }).call()
);

var confirmationLink = "https://uni-tuebingen.de/en/faculties/faculty-of-humanities/departments/modern-languages/department-of-linguistics/";

// Fisher-Yates shuffle function for randomization
function fisherYates(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

Sequence("consent", 
    "instructions", 
    "practice", "go", rshuffle("critical"), 
    "conclude", "exit", "demo", "debrief", SendResults(), "submit");

newTrial("consent",
    newHtml("consent_form", "consent.html")
        .cssContainer({"width":"720px"})
        .checkboxWarning("Sie müssen zustimmen, bevor Sie fortfahren können.")
        .print()
    ,
    newButton("continue", "Zustimmen und fortfahren")
        .css({
            "margin-top": "20px",
            "padding": "12px 24px",
            "font-size": "16px",
            "cursor": "pointer",
            "background-color": "#a51e37",
            "color": "white",
            "border": "none",
            "border-radius": "4px"
        })
        .cssContainer({"margin-bottom":"1em"})
        .center()
        .print()
        .wait(getHtml("consent_form").test.complete()
                  .failure(getHtml("consent_form").warn())
        )
);

newTrial("instructions",
    defaultText
        .cssContainer({"margin-bottom":"1em"})
        .center()
        .print(),
    newText("inst-1", "Wilkommen!"),
    newText("inst-2", "In diesem Experiment lesen Sie Sätze auf Deutsch, jeweils ein oder zwei Wörter auf einmal."),
    newText("inst-3", "Sie können durch die Leertaste durch jeden Satz weitergehen."),
    newButton("wait1", "Klicken Sie hier, um fortzufahren")
        .center()
        .print()
        .wait(),
    clear(),
    newText("inst-4", "Nach jedem Satz werden Sie gebeten, eine kurze Frage zu beantworten, die sich auf den Inhalt des Satzes bezieht."),
    newText("inst-5", "Diese haben immer zwei mögliche Antworten, auf der linken und rechten Seite des Bildschirms."),
    newText("inst-6", "Sie haben fünf Sekunden Zeit, um Ihre Antworten mit den Tasten F und J einzugeben."),
    newButton("wait2", "Klicken Sie hier, um fortzufahren")
        .center()
        .print()
        .wait(),
    clear(),
    newText("inst-7", "Sie sollten den Text natürlich lesen und die Fragen so gut wie möglich anhand des Gelesenen beantworten."),
    newText("inst-8", "Achten Sie auf jeden Teil des Satzes."),
    newText("inst-9", "Wir beginnen mit einigen geführten Übungen."),
    newButton("wait", "Klicken Sie hier, um das Experiment durchzuführen")
        .center()
        .print()
        .wait()
);

Template("Practice_german.csv", row =>
    newTrial("practice",
        newText("practice_inst", "Drücken Sie die Leertaste, um im Satz fortzufahren.")
            .cssContainer({"font-size":"12px", "font-style": "italic", "margin-bottom": "1em"})
            .center()
            .print(),
        newController("spr", "DashedSentence", {s: row.story})
            .log().print().wait()
            .center()
        ,
        clear(),
        newText("preq_text_practice", "Bitte warten Sie auf die Frage.")
            .cssContainer({"font-size":"12px", "font-style": "italic", "margin-bottom": "1em"})
            .center()
            .print()
        ,
        newTimer("preq_practice", 1000) // duration of pause before question
            .start()
            .wait()
        ,
        clear(),
        newController("Question", {q: row.question, 
            as: [["F",row.left], ["J", row.right]],
            randomOrder: false,
            presentHorizontally: true
        })
            .center()
            .print()
            .log()
        ,
        newText("practice_inst2", "Antworten Sie mit den Tasten F und J.")
            .cssContainer({"margin-top":"2em","font-size":"12px", "font-style": "italic"})
            .center()
            .print(),
        newTimer("timeout_practice", 5000) // timeout for question
            .start()
        ,
        newKey("answer_practice", "FJ") //F key for left choice, J key for right choice
            .callback( getTimer("timeout_practice").stop() ) //stops timer if key is clicked
            .log("first")
            .cssContainer({"line-height": "150%"})
        ,
        getTimer("timeout_practice")
            .wait()
        ,
        clear(),
        // Check if F was pressed
        getKey("answer_practice")
            .test.pressed("F")
            .success(
                // F was pressed - check if F is a correct answer
                row.correct.includes("F") 
                    ? newText("success_f_practice", row.correct=="FJ" ? "Beide Antworten sind möglich" : "Richtig!")
                        .center()
                        .cssContainer({"line-height": "150%", "margin-bottom": "1em"})
                        .print()
                    : newText("failure_f_practice", "Falsch")
                        .center()
                        .cssContainer({"color": "red", "line-height": "150%", "margin-bottom": "1em"})
                        .print()
            )
            .failure(
                // F was NOT pressed - check if J was pressed
                getKey("answer_practice").test.pressed("J")
                    .success(
                        // J was pressed - check if J is a correct answer
                        row.correct.includes("J")
                            ? newText("success_j_practice", row.correct=="FJ" ? "Beide Antworten sind möglich" : "Richtig!")
                                .center()
                                .cssContainer({"line-height": "150%", "margin-bottom": "1em"})
                                .print()
                            : newText("failure_j_practice", "Falsch")
                                .center()
                                .cssContainer({"color": "red", "line-height": "150%", "margin-bottom": "1em"})
                                .print()
                    )
                    .failure(
                        // Neither F nor J pressed (timeout)
                        newText("timeout_practice", "Die Zeit ist um")
                            .center()
                            .cssContainer({"color": "red", "line-height": "150%", "margin-bottom": "1em"})
                            .print()
                    )
            )
        ,
        newText("comment_practice", row.comment)
            .cssContainer({"margin-bottom": "1em"})
            .center()
            .print()
        ,
        newText("wait_practice", "Bitte warten Sie auf den nächsten Satz.")
            .cssContainer({"font-size":"12px", "font-style": "italic", "margin-bottom": "1em"})
            .center()
            .print()
        ,
        newTimer("afterQuestion_practice", 5000) // how long the message is presented for
            .start()
            .wait()
    )
    .log("story")
    .log("group", null)
    .log("item", row.item)
    .log("condition", null)
    .log("qtype", null)
    .log("correctKey", row.correct)
);

newTrial("go",
    defaultText
        .cssContainer({"margin-bottom":"1em"})
        .center()
        .print(),
    newText("go-1", "Das war's mit dem Training."),
    newText("go-2", "Zur Erinnerung: Lesen Sie mit der Leertaste und beantworten Sie dann jede Frage mit den Tasten F und J."),
    newText("go-3", "Vergessen Sie nicht, natürlich, aber sorgfältig zu lesen und so gut wie möglich zu antworten."),
    newText("go-4", "Vielen Dank! Klicken Sie unten, wenn Sie bereit sind, zu beginnen"),
    newButton("wait", "Klicken Sie hier, um fortzufahren")
        .center()
        .print()
        .wait()
);

// ============================================================
// CRITICAL TRIALS - Random group selection per item
// ============================================================
// NOTE: This uses Critical_modified.csv where 'group' was renamed to 'cond_group'
// to prevent PCIbex from using automatic Latin Square counterbalancing

// Step 1: Read all rows from Critical_modified.csv into a dictionary organized by item
const criticalItems = {}; // Dictionary: item -> array of rows (one per group)

Template("Critical.csv", row => {
    // Initialize array for this item if it doesn't exist
    if (criticalItems[row.item] === undefined) {
        criticalItems[row.item] = [];
    }
    // Store the entire row under its item number
    criticalItems[row.item].push(row);
    return {}; // Return empty object - we're not creating trials yet
});

// Step 2: Use a dummy table to execute selection logic after CSV is loaded
AddTable("dummy", "x\ny"); // Dummy one-row table

Template("dummy", () => {
    // Get all item keys
    const itemKeys = Object.keys(criticalItems);
    
    // For each item, randomly select one group
    const selectedTrials = [];
    
    for (let i = 0; i < itemKeys.length; i++) {
        const itemNumber = itemKeys[i];
        const rowsForThisItem = criticalItems[itemNumber];
        
        // Randomly select one row (one group) for this item
        const randomIndex = Math.floor(Math.random() * rowsForThisItem.length);
        const selectedRow = rowsForThisItem[randomIndex];
        
        // Create the trial for this selected row
        // Note: Using cond_group instead of group (column was renamed)
        const trial = ["critical", "PennController", newTrial(
            newText("critical_inst_"+itemNumber, "Drücken Sie die Leertaste, um im Satz fortzufahren.")
                .cssContainer({"font-size":"12px", "font-style": "italic", "margin-bottom": "1em"})
                .center()
                .print(),
            newController("spr", "DashedSentence", {s: selectedRow.story})
                .log().print().wait()
                .center()
            ,
            clear(),
            newText("preq_text_critical_"+itemNumber, "Bitte warten Sie auf die Frage.")
                .cssContainer({"font-size":"12px", "font-style": "italic", "margin-bottom": "1em"})
                .center()
                .print()
            ,
            newTimer("preq_critical_"+itemNumber, 1000)
                .start()
                .wait()
            ,
            clear(),
            newController("Question", {q: selectedRow.question, 
                as: [["F", selectedRow.left], ["J", selectedRow.right]],
                randomOrder: false,
                presentHorizontally: true
            })
                .center()
                .print()
                .log()
            ,
            newText("critical_inst2_"+itemNumber, "Antworten Sie mit den Tasten F und J.")
                .cssContainer({"margin-top":"2em","font-size":"12px", "font-style": "italic"})
                .center()
                .print(),
            newTimer("timeout_critical_"+itemNumber, 5000)
                .start()
            ,
            newKey("answer_critical_"+itemNumber, "FJ")
                .callback( getTimer("timeout_critical_"+itemNumber).stop() )
                .log("first")
                .cssContainer({"line-height": "150%"})
            ,
            getTimer("timeout_critical_"+itemNumber)
                .wait()
            ,
            clear(),
            // Check if F was pressed
            getKey("answer_critical_"+itemNumber)
                .test.pressed("F")
                .success(
                    selectedRow.correct.includes("F") 
                        ? newText("success_f_critical_"+itemNumber, selectedRow.correct=="FJ" ? "Beide Antworten sind möglich" : "Richtig!")
                            .center()
                            .cssContainer({"line-height": "150%", "margin-bottom": "1em"})
                            .print()
                        : newText("failure_f_critical_"+itemNumber, "Falsch")
                            .center()
                            .cssContainer({"color": "red", "line-height": "150%", "margin-bottom": "1em"})
                            .print()
                )
                .failure(
                    getKey("answer_critical_"+itemNumber).test.pressed("J")
                        .success(
                            selectedRow.correct.includes("J")
                                ? newText("success_j_critical_"+itemNumber, selectedRow.correct=="FJ" ? "Beide Antworten sind möglich" : "Richtig!")
                                    .center()
                                    .cssContainer({"line-height": "150%", "margin-bottom": "1em"})
                                    .print()
                                : newText("failure_j_critical_"+itemNumber, "Falsch")
                                    .center()
                                    .cssContainer({"color": "red", "line-height": "150%", "margin-bottom": "1em"})
                                    .print()
                        )
                        .failure(
                            newText("timeout_msg_critical_"+itemNumber, "Die Zeit ist um.")
                                .center()
                                .cssContainer({"color": "red", "line-height": "150%", "margin-bottom": "1em"})
                                .print()
                        )
                )
            ,
            newText("wait_critical_"+itemNumber, "Bitte warten Sie für den nächsten Satz.")
                .cssContainer({"font-size":"12px", "font-style": "italic", "margin-bottom": "1em"})
                .center()
                .print()
            ,
            newTimer("afterQuestion_critical_"+itemNumber, 1000)
                .start()
                .wait()
        )
            .log("adj_amb", selectedRow.adj_amb)
            .log("group", selectedRow.cond_group)  // Note: reading from cond_group, logging as group
            .log("item", selectedRow.item)
            .log("verb_bias", selectedRow.verb_bias)
            .log("explanation", selectedRow.explanation)
            .log("pronoun", selectedRow.pronoun)
            .log("pronoun_type", selectedRow.pronoun_type)
            .log("Ferstl_verb_eng", selectedRow.Ferstl_verb_eng)
            .log("Ferstl_sem_cat", selectedRow.Ferstl_sem_cat)
            .log("Ferstl_eng_verb_length", selectedRow.Ferstl_eng_verb_length)
            .log("Ferstl_eng_verb_freq", selectedRow.Ferstl_eng_verb_freq)
            .log("Ferstl_val", selectedRow.Ferstl_val)
            .log("Ferstl_IVC", selectedRow.Ferstl_IVC)
            .log("adj", selectedRow.adj)
            .log("german_adj_freq", selectedRow.german_adj_freq)
            .log("german_adj_length", selectedRow.german_adj_length)
            .log("verb", selectedRow.verb)
            .log("german_verb_freq", selectedRow.german_verb_freq)
            .log("german_verb_length", selectedRow.german_verb_length)
            .log("Susanne_avgRating_Score", selectedRow.Susanne_avgRating_Score)
            .log("story", selectedRow.story)
            .log("question", selectedRow.question)
            .log("correctKey", selectedRow.correct)
            .log("left", selectedRow.left)
            .log("right", selectedRow.right)
            .log("left_pronoun", selectedRow.left_pronoun)
            .log("right_pronoun", selectedRow.right_pronoun)
        ];
        
        selectedTrials.push(trial);
    }
    
    // Shuffle the trials order
    fisherYates(selectedTrials);
    
    // Add trials to the experiment
    window.items = (window.items || []).concat(selectedTrials);
    
    return {}; // Return empty object
});

// ============================================================
// END OF CRITICAL TRIALS
// ============================================================


newTrial("conclude",
    defaultText
        .cssContainer({"margin-bottom":"1em"})
        .center()
        .print(),
    newText("end-1", "Sie haben nun den Hauptteil des Experiments abgeschlossen."),
    newText("end-2", "Bevor Sie fertig sind, haben wir noch drei kurze Formulare für Sie zum Ausfüllen."),
    newText("end-3", "Nachdem alle drei Schritte ausgeführt wurden, werden Sie zur Bestätigung zu Prolific weitergeleitet."),
    newText("end-4", "Klicken Sie unten, um diese Formulare auszufüllen."),
    newButton("wait", "Klicken Sie hier, um fortzufahren")
        .center()
        .print()
        .wait()
);

newTrial("exit",
    newHtml("exit_form", "exit.html")
        .cssContainer({"width":"720px"})
        .inputWarning("Sie müssen alle Fragen beantworten, bevor Sie fortfahren können.")
        .print().log()
    ,
    newButton("continue", "Klicken Sie hier, um fortzufahren")
        .cssContainer({"margin-bottom":"1em"})
        .center()
        .print()
        .wait(getHtml("exit_form").test.complete()
                  .failure(getHtml("exit_form").warn())
        )
);

newTrial("demo",
    newHtml("demo_form", "demo.html")
        .cssContainer({"width":"720px"})
        .inputWarning("Sie müssen alle Fragen beantworten, bevor Sie fortfahren können.")
        .print().log()
    ,
    newButton("continue", "Klicken Sie hier, um fortzufahren")
        .cssContainer({"margin-bottom":"1em"})
        .center()
        .print()
        .wait(getHtml("demo_form").test.complete()
                  .failure(getHtml("demo_form").warn())
        )
);

newTrial("debrief",
    newHtml("debrief_form", "debrief.html")
        .cssContainer({"width":"720px"})
        .print()
    ,
    newButton("continue", "Klicken Sie hier, um fortzufahren")
        .cssContainer({"margin-bottom":"1em"})
        .center()
        .print()
        .wait()
);

newTrial("submit" ,
     newText("<p>Vielen Dank für Ihre Teilnahme!</p>")
                .center()
            .print()
    ,
    newText("<a href='"+confirmationLink+"' target='_blank' style='font-weight: bold;'>Klicken Sie hier für die Bestätigung auf Prolific</a>"+
    "<p>Dies ist ein notwendiger Schritt, damit Sie Ihre Zahlung erhalten können!</p>")
    .center()
    .print()
    ,
    newButton("void")
    .wait()
    )