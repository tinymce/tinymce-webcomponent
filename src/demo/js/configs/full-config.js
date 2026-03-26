var fullConfig = (function (exports) {
  'use strict';

  const JWT_SERVER_URL = 'https://tinymce-ai-jwt.onrender.com';

  var TinymceaiConfig = {
    config: {
      // tinymceai_api_url: 'https://tinymceai.api.staging.tiny.cloud/',

      // REQUIRED: tinymceai_service_url — Base URL of the AI backend service
      // tinymceai_service_url: 'https://tinymceai.api.staging.tiny.cloud/',
      // tinymceai_service_url: 'https://tinymceai.api.dev.tiny.cloud/',
       tinymceai_token_provider: () => {
        return fetch(`${JWT_SERVER_URL}/jwt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }).then(r => r.json());
      },


      // content_id — Groups conversations by document
      content_id: 'render_doc_1',

      // tinymceai_sidebar_type — 'static' | 'floating' (default: 'static')
      tinymceai_sidebar_type: 'static',

      // Model configuration
      // Available Models: auto (agent-1), gpt-5.2, gpt-5.1, gpt-5, gpt-5-mini,
      //   claude-4-5-haiku, claude-4-5-sonnet, gemini-3-pro, gemini-3-flash,
      //   gemini-2-5-flash, gpt-4.1, gpt-4.1-mini

      // tinymceai_default_model — Model ID to select by default
      tinymceai_default_model: 'auto',

      // tinymceai_allow_model_selection — Show model selection dropdown (default: true)
      tinymceai_allow_model_selection: true,

      // tinymceai_quickactions_menu — Items in the Quick Actions menu
      // Correct control IDs: ai-quickactions-chat-prompts, ai-quickactions-improve-writing,
      //   ai-quickactions-continue-writing, ai-quickactions-check-grammar,
      //   ai-quickactions-change-length, ai-quickactions-change-tone,
      //   ai-quickactions-translate, ai-quickactions-custom
      tinymceai_quickactions_menu: [
        'ai-quickactions-chat-prompts',
        'ai-quickactions-improve-writing',
        'ai-quickactions-continue-writing',
        'ai-quickactions-check-grammar',
        'ai-quickactions-change-length',
        'ai-quickactions-change-tone',
        'ai-quickactions-translate',
        'ai-quickactions-custom'
      ],

      // tinymceai_quickactions_chat_prompts — Items in the "Chat commands" sub-menu
      // Correct control IDs: ai-chat-explain, ai-chat-summarize, ai-chat-highlight-key-points
      tinymceai_quickactions_chat_prompts: [
        'ai-chat-explain',
        'ai-chat-summarize',
        'ai-chat-highlight-key-points'
      ],

      // tinymceai_quickactions_change_tone_menu — Items in the "Change tone" sub-menu
      // Correct control IDs: ai-quickactions-tone-casual, ai-quickactions-tone-direct,
      //   ai-quickactions-tone-friendly, ai-quickactions-tone-confident, ai-quickactions-tone-professional
      tinymceai_quickactions_change_tone_menu: [
        'ai-quickactions-tone-casual',
        'ai-quickactions-tone-direct',
        'ai-quickactions-tone-friendly',
        'ai-quickactions-tone-confident',
        'ai-quickactions-tone-professional'
      ],

      // tinymceai_languages — Languages in the "Translate" sub-menu
      // Each item: { title: string, language: string }
      tinymceai_languages: [
        { title: 'English', language: 'english' },
        { title: 'Chinese (Simplified)', language: 'chinese' },
        { title: 'Spanish', language: 'spanish' },
        { title: 'German', language: 'german' },
        { title: 'Japanese', language: 'japanese' },
        { title: 'Portuguese', language: 'portuguese' },
        { title: 'Korean', language: 'korean' },
        { title: 'Italian', language: 'italian' },
        { title: 'Russian', language: 'russian' },
        { title: 'French', language: 'french' }
      ],

      // tinymceai_quickactions_custom — Custom commands in the "Other" sub-menu
      // Chat type: { type: 'chat', title: string, prompt: string }
      // Action type: { type: 'action', title: string, prompt: string, model: string }
      tinymceai_quickactions_custom: [
        {
          type: 'chat',
          title: 'Generate Outline',
          prompt: 'Create a detailed outline for the selected content'
        },
        {
          type: 'action',
          title: 'Convert to Table',
          prompt: 'Convert this data into an HTML table',
          model: 'gpt-4.1'
        },
        {
          type: 'chat',
          title: 'Explain Like I\'m 5',
          prompt: 'Explain the selected content as if I am a 5 year old child'
        }
      ],

      // tinymceai_chat_welcome_message — Custom HTML welcome message in chat sidebar
      tinymceai_chat_welcome_message: '<p><strong>Welcome to AI Chat!</strong></p><p>I can help you write, edit, review, and brainstorm. Ask me anything or use the quick actions above.</p>',

      // tinymceai_chat_fetch_sources — Provides a list of external sources users can attach
      // Returns Promise<ExternalSourcesList[]>
      tinymceai_chat_fetch_sources: () => {
        console.log('[tinymceai] tinymceai_chat_fetch_sources called');
        return Promise.resolve([
          {
            label: 'Sample Documents',
            icon: 'document-properties',
            sources: [
              { label: 'Company Guidelines', id: 'doc-guidelines', type: 'web-resource' },
              { label: 'Product Roadmap', id: 'doc-roadmap', type: 'file' },
              { label: 'FAQ Document', id: 'doc-faq', type: 'web-resource' }
            ]
          }
        ]);
      },

      // tinymceai_chat_fetch_source — Fetches a specific external source by ID
      // Returns Promise<ExternalContextSource> — { type: 'file', file: File } or { type: 'web-resource', url: string }
      tinymceai_chat_fetch_source: (id) => {
        console.log('[tinymceai] tinymceai_chat_fetch_source called with id:', id);
        if (id === 'doc-guidelines') {
          return Promise.resolve({ type: 'web-resource', url: 'https://www.tiny.cloud' });
        } else if (id === 'doc-roadmap') {
          const blob = new Blob(['Sample roadmap content for testing'], { type: 'text/plain' });
          const file = new File([blob], 'roadmap.txt', { type: 'text/plain' });
          return Promise.resolve({ type: 'file', file: file });
        } else {
          return Promise.resolve({ type: 'web-resource', url: 'https://www.tiny.cloud/docs' });
        }
      },
    },
    toolbar: 'tinymceai-chat tinymceai-review tinymceai-quickactions',
    name: 'tinymceai',
  };

  const advtemplate_templates = [
  		{
  			id: '1',
  			title: 'Quick replies',
  			items: [
  				{
  					id: '2',
  					title: 'Message received',
  					content: '<p dir="ltr">Hey {{Customer.FirstName}}!</p>\n<p dir="ltr">Just a quick note to say we&rsquo;ve received your message, and will get back to you within 48 hours.</p>\n<p dir="ltr">For reference, your ticket number is: {{Ticket.Number}}</p>\n<p dir="ltr">Should you have any questions in the meantime, just reply to this email and it will be attached to this ticket.</p>\n<p><strong>&nbsp;</strong></p>\n<p dir="ltr">Regards,</p>\n<p dir="ltr">{{Agent.FirstName}}</p>'
  				},
  				{
  					id: '3',
  					title: 'Thanks for the feedback',
  					content: '<p dir="ltr">Hi {{Customer.FirstName}},</p>\n<p dir="ltr">We appreciate you taking the time to provide feedback on {{Product.Name}}.</p>\n<p dir="ltr">It sounds like it wasn&rsquo;t able to fully meet your expectations, for which we apologize. Rest assured our team looks at each piece of feedback and uses it to decide what to focus on next with {{Product.Name}}.</p>\n<p dir="ltr"><strong>&nbsp;</strong></p>\n<p dir="ltr">All the best, and let us know if there&rsquo;s anything else we can do to help.</p>\n<p dir="ltr">-{{Agent.FirstName}}</p>'
  				},
  				{
  					id: '6',
  					title: 'Still working on case',
  					content: '<p dir="ltr"><img src="https://lh4.googleusercontent.com/-H7w_COxrsy2fVpjO6RRnoBsujhaLyg6AXux5zidqmQ_ik1mrE6BtnaTUdWYQuVbtKpviRqQiuPBOHNGUsEXvrRliEHc4-hKDrCLgQQ9Co-MI4uY2ehUvYtU1nn3EeS0WiUzST-7MQB2Z5YFXrMDwRk" width="320" height="240"></p>\n<p><strong>&nbsp;</strong></p>\n<p dir="ltr">Hi {{Customer.FirstName}},</p>\n<p dir="ltr">Just a quick note to let you know we&rsquo;re still working on your case. It&rsquo;s taking a bit longer than we hoped, but we&rsquo;re aiming to get you an answer in the next 48 hours.</p>\n<p dir="ltr">Stay tuned,</p>\n<p dir="ltr">{{Agent.FirstName}}</p>'
  				}
  			]
  		},
  		{
  			id: '4',
  			title: 'Closing tickets',
  			items: [
  				{
  					id: '7',
  					title: 'Closing ticket',
  					content: '<p dir="ltr">Hi {{Customer.FirstName}},</p>\n<p dir="ltr">We haven&rsquo;t heard back from you in over a week, so we have gone ahead and closed your ticket number {{Ticket.Number}}.</p>\n<p dir="ltr">If you&rsquo;re still running into issues, not to worry, just reply to this email and we will re-open your ticket.</p>\n<p><strong>&nbsp;</strong></p>\n<p dir="ltr">All the best,</p>\n<p dir="ltr">{{Agent.FirstName}}</p>'
  				},
  				{
  					id: '8',
  					title: 'Post-call survey',
  					content: '<p dir="ltr">Hey {{Customer.FirstName}}!</p>\n<p dir="ltr">&nbsp;</p>\n<p dir="ltr">How did we do?</p>\n<p dir="ltr">If you have a few moments, we&rsquo;d love you to fill out our post-support survey: {{Survey.Link}}</p>\n<p><strong>&nbsp;</strong></p>\n<p dir="ltr">Thanks in advance!<br>{{Company.Name}} Customer Support</p>'
  				}
  			]
  		},
  		{
  			id: '5',
  			title: 'Product support',
  			items: [
  				{
  					id: '9',
  					title: 'How to find model number',
  					content: '<p dir="ltr">Hi {{Customer.FirstName}},</p>\n<p><strong>&nbsp;</strong></p>\n<p dir="ltr">My name is {{Agent.FirstName}} and I will be glad to assist you today.</p>\n<p dir="ltr">To troubleshoot your issue, we first need your model number, which can be found on the underside of your product beneath the safety warning label.&nbsp;</p>\n<p dir="ltr">It should look something like the following: XX.XXXXX.X</p>\n<p dir="ltr">Once you send it over, I will advise on next steps.</p>\n<p><strong>&nbsp;</strong></p>\n<p dir="ltr">Thanks!</p>\n<p dir="ltr">{{Agent.FirstName}}</p>'
  				},
  				{
  					id: '10',
  					title: 'Support escalation',
  					content: '<p dir="ltr"><img src="https://lh3.googleusercontent.com/z4hleIymnERrS9OQQMBwmkqVne8kYZA0Kly9Ny64pp4fi47CWWUy30Q0-UkjGf-K-50zrfR-wltHUTbExzZ7VUSUAUG60Fll5f2E0UZcKjKoa-ZVlIcuOoe-RRckFWqiihUOfVds7pXtM8Y59uy2hpw" width="295" height="295"></p>\n<p><strong>&nbsp;</strong></p>\n<p dir="ltr">Hi {{Customer.FirstName}},</p>\n<p dir="ltr">We have escalated your ticket {{Ticket.Number}} to second-level support.</p>\n<p dir="ltr">You should hear back from the new agent on your case, {{NewAgent.FirstName}}, shortly.</p>\n<p><strong>&nbsp;</strong></p>\n<p dir="ltr">Thanks,</p>\n<p dir="ltr">{{Company.Name}} Customer Support</p>'
  				}
  			]
  		},
  		{
  			id: '6',
  			title: 'Email Signatures',
  			items: [
  				{
  					id: '11',
  					title: 'Tiny Signature',
  					content: '<p>Regards<br /><br /><br /><a title="Tiny Technologies Inc" href="https://www.tiny.cloud/" target="_blank"><img src="https://www.tiny.cloud/email-static/tiny-logo.png" alt="Tiny Technologies Inc" width="130" height="42" /></a></p><p>Shiridi Gandham<br />QA Template Manager</p><p>Email:&nbsp;<a title="Email Shiridi" href="mailto:shiridi.gandham@tiny.cloud" target="_blank">shiridi.gandham@tiny.cloud</a><br />Phone:&nbsp;(+617) 3161 3557</p><p>Tiny Technologies<br /><a title="Tiny Technologies" href="https://www.tiny.cloud/" target="_blank">www.tiny.cloud</a></p><p><a title="Linkedin" href="https://www.linkedin.com/company/jointiny/" target="_blank" aria-invalid="true"><img src="https://www.tiny.cloud/email-static/social-linkedin.png" alt="Linkedin" width="20" height="20" /></a>&nbsp;<a title="Facebook" href="https://www.facebook.com/jointiny" target="_blank"><img src="https://www.tiny.cloud/email-static/social-facebook.png" alt="Facebook" width="20" height="20" /></a>&nbsp;<a title="Twitter" href="https://twitter.com/joinTiny" target="_blank"><img src="https://www.tiny.cloud/email-static/social-twitter.png" alt="Twitter" width="20" height="20" /></a>&nbsp;<a title="GitHub" href="https://github.com/tinymce/" target="_blank"><img src="https://www.tiny.cloud/email-static/social-github.png" alt="GitHub" width="20" height="20" /></a>&nbsp;<a title="Stack Overflow" href="https://stackoverflow.com/questions/tagged/tinymce" target="_blank"><img src="https://www.tiny.cloud/email-static/social-stackoverflow.png" alt="Stack Overflow" width="20" height="20" /></a></p>'
  				}
  			]
  		}
  	];

  var AdvtemplateConfig = {
    toolbar: 'addtemplate inserttemplate',
      name: 'advtemplate',
      config: {
        advtemplate_templates
      }
  };

  var AccordionConfig = {
    name: 'accordion',
    toolbar: 'accordion',
    config: {}
  };

  const mergetags_list = [
  		{
  			value: 'Current.Date',
  			title: 'Current date in DD/MM/YYYY format'
  		},
  		{
  			value: 'Campaign.Toc',
  			title: 'Linked table of contents in your campaign'
  		},
  		{
  			title: 'Phone',
  			menu: [
  				{
  					value: 'Phone.Home'
  				},
  				{
  					value: 'Phone.work'
  				}
  			]
  		},
  		{
  			title: 'Person',
  			menu: [
  				{
  					value: 'Person.Name'
  				},
  				{
  					value: 'Person.Name.First'
  				},
  				{
  					value: 'Person.Name.Last'
  				},
  				{
  					value: 'Person.Name.Full'
  				},
  				{
  					title: 'Email',
  					menu: [
  						{
  							value: 'Person.Email.Work'
  						},
  						{
  							value: 'Person.Email.Home'
  						}
  					]
  				}
  			]
  		}
  	];

    var MergetagsConfig = {
    toolbar: 'mergetags',
      name: 'mergetags',
      config: {
        mergetags_prefix: '${',
        mergetags_suffix: '}',
        mergetags_list,
      }
    };

  const API_URL$1 = 'https://demouserdirectory.tiny.cloud/v1/users';

  const mentions_fetch = async (query, success) => {
    const searchPhrase = query.term.toLowerCase();
    await fetch(`${API_URL$1}?q=${encodeURIComponent(searchPhrase)}`)
    .then((response) => response.json())
    .then((users) => success(users.data.map((userInfo) => ({
      id: userInfo.id,
      name: userInfo.name,
      image: userInfo.avatar,
      description: userInfo.custom.role
    }))))
    .catch((error) => console.log(error));
  };

  const mentions_menu_complete = (editor, userInfo) => {
    const span = editor.getDoc().createElement('span');
    span.className = 'mymention';
    span.setAttribute('data-mention-id', userInfo.id);
    span.appendChild(editor.getDoc().createTextNode('@' + userInfo.name));
    return span;
  };

  const createCard = (userInfo) => {
    const div = document.createElement('div');
    div.innerHTML = (
      '<div class="card">' +
        '<img class="avatar" src="' + userInfo.image + '">' +
        '<h1>' + userInfo.name + '</h1>' +
        '<p>' + userInfo.description + '</p>' +
      '</div>'
    );
    return div;
  };

  const mentions_menu_hover = async (userInfo, success) => {
    const card = createCard(userInfo);
    success(card);
  };

  const mentions_select = async (mention, success) => {
    const id = mention.getAttribute('data-mention-id');
    await fetch(`${API_URL$1}/${id}`)
      .then((response) => response.json())
      .then((userInfo) => {
        const card = createCard({
          id: userInfo.id,
          name: userInfo.name,
          image: userInfo.avatar,
          description: userInfo.custom.role
        });
        success(card);
      })
      .catch((error) => console.error(error));
  };

  var MentionsConfig = {
    toolbar: 'mentions',
    name: 'mentions',
    config: {
      mentions_fetch,
      mentions_menu_complete,
      mentions_menu_hover,
      mentions_select,
      mentions_selector: '.mymention',
      mentions_item_type: 'profile',
      mentions_min_chars: 0,
    }
  };

  const user_id$1 = 'james-wilson';

  const tinycomments_create = (req, done, fail) => {
    if (req.content === 'fail') {
      fail(new Error('Something has gone wrong...'));
    } else {
      const uid = 'annotation-' + randomString();
      conversationDb[uid] = {
        uid,
        comments: [{
          uid,
          author: user_id$1,
          authorName: 'James Wilson',
          authorAvatar: 'https://sneak-preview.tiny.cloud/demouserdirectory/images/employee_james-wilson_128_52f19412.jpg',
          content: req.content,
          createdAt: req.createdAt,
          modifiedAt: req.createdAt
        }]
      };
      setTimeout(() => done({ conversationUid: uid }), fakeDelay);
    }
  };

  const fakeDelay = 200;

  const randomString = () => {
    return crypto.getRandomValues(new Uint32Array(1))[0].toString(36).substring(2, 14);
  };


  const conversationDb = {};

  const tinycomments_reply = (req, done) => {
    const replyUid = 'annotation-' + randomString();
    conversationDb[req.conversationUid].comments.push({
      uid: replyUid,
      author: user_id$1,
      authorName: 'James Wilson',
      authorAvatar: 'https://sneak-preview.tiny.cloud/demouserdirectory/images/employee_james-wilson_128_52f19412.jpg',
      content: req.content,
      createdAt: req.createdAt,
      modifiedAt: req.createdAt
    });
    setTimeout(() => done({ commentUid: replyUid }), fakeDelay);
  };

  const tinycomments_delete = (req, done) => {
    {
      setTimeout(() => done({ canDelete: false, reason: 'Must be admin user' }), fakeDelay);
    }
  };

  const tinycomments_resolve = (req, done) => {
    const conversation = conversationDb[req.conversationUid];
    if (user_id$1 === conversation.comments[0].author) { // Replace wth your own logic, e.g. check if user has admin priveleges
      delete conversationDb[req.conversationUid];
      setTimeout(() => done({ canResolve: true }), fakeDelay);
    } else {
      setTimeout(() => done({ canResolve: false, reason: 'Must be conversation author' }), fakeDelay);
    }
  };

  const tinycomments_delete_comment = (req, done) => {
    const oldcomments = conversationDb[req.conversationUid].comments;
    let reason = 'Comment not found';

    const newcomments = oldcomments.filter((comment) => {
      if (comment.uid === req.commentUid) { // Found the comment to delete
        if (user_id$1 === comment.author) { // Replace with your own logic, e.g. check if user has admin privileges
          return false; // Remove the comment
        } else {
          reason = 'Not authorised to delete this comment'; // Update reason
        }
      }
      return true; // Keep the comment
    });

    if (newcomments.length === oldcomments.length) {
      setTimeout(() => done({ canDelete: false, reason }), fakeDelay);
    } else {
      conversationDb[req.conversationUid].comments = newcomments;
      setTimeout(() => done({ canDelete: true }), fakeDelay);
    }
  };

  const tinycomments_edit_comment = (req, done) => {
    const oldcomments = conversationDb[req.conversationUid].comments;
    let reason = 'Comment not found';
    let canEdit = false;

    const newcomments = oldcomments.map((comment) => {
      if (comment.uid === req.commentUid) { // Found the comment to delete
        if (user_id$1 === comment.author) { // Replace with your own logic, e.g. check if user has admin privileges
          canEdit = true; // User can edit the comment
          return { ...comment, content: req.content, modifiedAt: new Date().toISOString() }; // Update the comment
        } else {
          reason = 'Not authorised to edit this comment'; // Update reason
        }
      }
      return comment; // Keep the comment
    });

    if (canEdit) {
      conversationDb[req.conversationUid].comments = newcomments;
      setTimeout(() => done({ canEdit }), fakeDelay);
    } else {
      setTimeout(() => done({ canEdit, reason }), fakeDelay);
    }
  };

  const tinycomments_delete_all = (req, done) => {
    const conversation = conversationDb[req.conversationUid];
    if (user_id$1 === conversation.comments[0].author) { // Replace wth your own logic, e.g. check if user has admin priveleges
      delete conversationDb[req.conversationUid];
      setTimeout(() => done({ canDelete: true }), fakeDelay);
    } else {
      setTimeout(() => done({ canDelete: false, reason: 'Must be conversation author' }), fakeDelay);
    }
  };

  const tinycomments_lookup = (req, done) => {
    setTimeout(() => {
      done({
        conversation: {
          uid: conversationDb[req.conversationUid].uid,
          comments: [...conversationDb[req.conversationUid].comments]
        }
      });
    }, fakeDelay);
  };

  const tinycomments_fetch = (conversationUids, done) => {
    const fetchedConversations = {};
    conversationUids.forEach((uid) => {
      const conversation = conversationDb[uid];
      if (conversation) {
        fetchedConversations[uid] = {...conversation};
      }
    });
    setTimeout(() => done({ conversations: fetchedConversations }), fakeDelay);
  };

  var TinyCommentsConfig = {
    toolbar: 'comments',
      name: 'tinycomments',
      config: {
        tinycomments_mode: 'callback',
        tinycomments_mentions_enabled: true,
        tinycomments_create,
        tinycomments_reply,
        tinycomments_delete,
        tinycomments_resolve,
        tinycomments_delete_all,
        tinycomments_lookup,
        tinycomments_delete_comment,
        tinycomments_edit_comment,
        tinycomments_fetch,
        // Fallback TinyMCE < 7.8
        tinycomments_author: user_id$1,
        tinycomments_author_name: 'James Wilson',
        tinycomments_avatar: 'https://sneak-preview.tiny.cloud/demouserdirectory/images/employee_james-wilson_128_52f19412.jpg',
        // Fallback for tinymce >= 7.8
        tinycomments_fetch_author_info: (done) => {
          setTimeout(() => done({
            author: user_id$1,
            authorName: 'James Wilson',
            authorAvatar: 'https://sneak-preview.tiny.cloud/demouserdirectory/images/employee_james-wilson_128_52f19412.jpg',
          }), fakeDelay);
        },
      }
  };

  var AdvlistConfig = {
    toolbar: 'numlist bullist',
    name: 'advlist',
    config: {
      advlist_number_styles: "default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman",
      advlist_bullet_styles: "default,circle,disc,square",
    },
    // Code samples for each configuration option:
    //
    // advlist_number_styles
    // Specifies the number styles available in the list style dropdown
    // - default: Standard numbering (1, 2, 3...)
    // - lower-alpha: Lowercase letters (a, b, c...)
    // - lower-greek: Lowercase Greek letters (α, β, γ...)
    // - lower-roman: Lowercase Roman numerals (i, ii, iii...)
    // - upper-alpha: Uppercase letters (A, B, C...)
    // - upper-roman: Uppercase Roman numerals (I, II, III...)
    // Usage: advlist_number_styles: "default,lower-alpha,lower-roman"
    //
    // advlist_bullet_styles
    // Specifies the bullet styles available in the list style dropdown
    // - default: Standard bullet point (•)
    // - circle: Open circle (○)
    // - disc: Filled circle/disc (●)
    // - square: Square bullet (■)
    // Usage: advlist_bullet_styles: "default,circle,square"
  };

  const suggestededitsModel = {
      'history': {
          '2': [
              {
                  'id': 1,
                  'uid': 'james-wilson',
                  'timestamp': 1752576936000,
                  'feedback': 'Nice improvement!'
              }
          ]
      },
      'version': 1,
      'contents': [
          {
              'type': 'p',
              'children': [
                  {
                      'type': 'img',
                      'attrs': {
                          'style': 'display: block; margin-left: auto; margin-right: auto;',
                          'title': 'Tiny Logo',
                          'src': 'https://www.tiny.cloud/docs/images/logos/android-chrome-256x256.png',
                          'alt': 'TinyMCE Logo',
                          'width': '128',
                          'height': '128'
                      }
                  }
              ]
          },
          {
              'type': 'h2',
              'attrs': {
                  'style': 'text-align: center;'
              },
              'children': [
                  {
                      'text': 'Welcome to the TinyMCE Suggested Edits '
                  },
                  {
                      'text': 'interactive ',
                      'opData': {
                          'id': 1,
                          'type': 'insert',
                          'uid': 'alex-thompson',
                          'timestamp': 1752015064000
                      }
                  },
                  {
                      'text': 'demo!'
                  }
              ]
          },
          {
              'type': 'p',
              'attrs': {
                  'style': 'text-align: center;'
              },
              'children': [
                  {
                      'text': 'Try out the Suggested Edits feature'
                  },
                  {
                      'text': ': type in the editor, apply formatting or delete some content. T',
                      'opData': {
                          'id': 2,
                          'type': 'insert',
                          'uid': 'alex-thompson',
                          'timestamp': 1752415064000
                      }
                  },
                  {
                      'text': ' by typing in the editor and t',
                      'opData': {
                          'id': 2,
                          'type': 'remove',
                          'uid': 'alex-thompson',
                          'timestamp': 1752415064000
                      }
                  },
                  {
                      'text': 'hen'
                  },
                  {
                      'text': ',',
                      'opData': {
                          'id': 3,
                          'type': 'insert',
                          'uid': 'alex-thompson',
                          'timestamp': 1752515064000
                      }
                  },
                  {
                      'text': ' click'
                  },
                  {
                      'text': 'ing',
                      'opData': {
                          'id': 4,
                          'type': 'remove',
                          'uid': 'alex-thompson',
                          'timestamp': 1752515064000
                      }
                  },
                  {
                      'text': ' the Review Changes button in the toolbar'
                  },
                  {
                      'text': ' to see your changes',
                      'opData': {
                          'id': 5,
                          'type': 'insert',
                          'uid': 'kai-nakamura',
                          'timestamp': 1752615064000
                      }
                  },
                  {
                      'text': '.'
                  }
              ]
          },
          {
              'type': 'p',
              'attrs': {
                  'style': 'text-align: center;'
              },
              'children': [
                  {
                      'text': 'And visit the '
                  },
                  {
                      'text': 'pricing page',
                      'opData': {
                          'id': 6,
                          'type': 'modify',
                          'uid': 'kai-nakamura',
                          'timestamp': 1752615064000
                      },
                      'format': [
                          {
                              'type': 'a',
                              'attrs': {
                                  'href': 'https://www.tiny.cloud/pricing'
                              }
                          }
                      ],
                      'oldFormat': [
                          {
                              'type': 'a',
                              'attrs': {
                                  'href': 'https://www.tiny.cloud/pricing'
                              }
                          },
                          'em'
                      ]
                  },
                  {
                      'text': ' to learn more about our Premium plugins.'
                  }
              ]
          },
          {
              'type': 'h2',
              'children': [
                  {
                      'text': 'A simple table to play with'
                  }
              ]
          },
          {
              'type': 'table',
              'attrs': {
                  'style': 'border-collapse: collapse; width: 100%;',
                  'border': '1'
              },
              'children': [
                  {
                      'type': 'thead',
                      'children': [
                          {
                              'type': 'tr',
                              'attrs': {
                                  'style': 'text-align: left;'
                              },
                              'children': [
                                  {
                                      'type': 'th',
                                      'children': [
                                          {
                                              'text': 'Product'
                                          }
                                      ]
                                  },
                                  {
                                      'type': 'th',
                                      'children': [
                                          {
                                              'text': 'Cost'
                                          }
                                      ]
                                  },
                                  {
                                      'type': 'th',
                                      'children': [
                                          {
                                              'text': 'Really?'
                                          }
                                      ]
                                  }
                              ]
                          }
                      ]
                  },
                  {
                      'type': 'tbody',
                      'children': [
                          {
                              'type': 'tr',
                              'children': [
                                  {
                                      'type': 'td',
                                      'children': [
                                          {
                                              'text': 'TinyMCE Cloud'
                                          }
                                      ]
                                  },
                                  {
                                      'type': 'td',
                                      'children': [
                                          {
                                              'text': 'Get started for free'
                                          }
                                      ]
                                  },
                                  {
                                      'type': 'td',
                                      'children': [
                                          {
                                              'text': 'Yes!',
                                              'format': [
                                                  'strong'
                                              ]
                                          }
                                      ]
                                  }
                              ]
                          },
                          {
                              'type': 'tr',
                              'children': [
                                  {
                                      'type': 'td',
                                      'children': [
                                          {
                                              'text': 'Plupload'
                                          }
                                      ]
                                  },
                                  {
                                      'type': 'td',
                                      'children': [
                                          {
                                              'text': 'Free'
                                          }
                                      ]
                                  },
                                  {
                                      'type': 'td',
                                      'children': [
                                          {
                                              'text': 'Yes!',
                                              'format': [
                                                  'strong'
                                              ]
                                          }
                                      ]
                                  }
                              ]
                          }
                      ]
                  }
              ]
          },
          {
              'type': 'h2',
              'opData': {
                  'id': 7,
                  'type': 'insert',
                  'uid': 'mia-andersson',
                  'timestamp': 1752576331000
              },
              'children': [
                  {
                      'text': 'Found a bug?'
                  }
              ]
          },
          {
              'type': 'p',
              'children': [
                  {
                      'text': ' ',
                      'opData': {
                          'id': 7,
                          'type': 'remove',
                          'uid': 'mia-andersson',
                          'timestamp': 1752576331000
                      }
                  },
                  {
                      'text': 'If you believe you have found a bug please create an issue on the ',
                      'opData': {
                          'id': 7,
                          'type': 'insert',
                          'uid': 'mia-andersson',
                          'timestamp': 1752576331000
                      }
                  },
                  {
                      'text': 'GitHub repo',
                      'opData': {
                          'id': 7,
                          'type': 'insert',
                          'uid': 'mia-andersson',
                          'timestamp': 1752576331000
                      },
                      'format': [
                          {
                              'type': 'a',
                              'attrs': {
                                  'href': 'https://github.com/tinymce/tinymce/issues'
                              }
                          }
                      ]
                  },
                  {
                      'text': ' to report it to the developers.',
                      'opData': {
                          'id': 7,
                          'type': 'insert',
                          'uid': 'mia-andersson',
                          'timestamp': 1752576331000
                      }
                  }
              ]
          },
          {
              'type': 'h2',
              'children': [
                  {
                      'text': 'Finally…'
                  }
              ]
          },
          {
              'type': 'p',
              'children': [
                  {
                      'text': 'Don’t forget to check out '
                  },
                  {
                      'text': 'Plupload',
                      'format': [
                          {
                              'type': 'a',
                              'attrs': {
                                  'href': 'http://www.plupload.com',
                                  'target': '_blank',
                                  'rel': 'noopener'
                              }
                          }
                      ]
                  },
                  {
                      'text': ', the upload solution featuring HTML5 upload support.'
                  }
              ]
          },
          {
              'type': 'p',
              'children': [
                  {
                      'text': 'Thanks for supporting TinyMCE. We hope it helps you and your users create great content.'
                  }
              ]
          },
          {
              'type': 'p',
              'children': [
                  {
                      'text': 'All the best from the TinyMCE team.'
                  }
              ]
          }
      ]
  };

  var SuggestedEditConfig = {
    toolbar: 'suggestededits',
    name: 'suggestededits',
    config: {
      suggestededits_model: suggestededitsModel,
      suggestededits_access: 'full',
      suggestededits_content: 'html',
    },
  };

  var CodeSampleConfig = {
    name: 'codesample',
    toolbar: 'codesample',
    config: {
      codesample_languages: [
        { text: 'HTML/XML', value: 'markup' },
        { text: 'JavaScript', value: 'javascript' },
        { text: 'CSS', value: 'css' },
        { text: 'PHP', value: 'php' },
        { text: 'Ruby', value: 'ruby' },
        { text: 'Python', value: 'python' },
        { text: 'Java', value: 'java' },
        { text: 'C', value: 'c' },
        { text: 'C#####', value: 'csharpppppp' },
        { text: 'C++', value: 'cpp' }
      ],
    }
  };

  var ExportWordConfig = {
    toolbar: 'exportword',
    name: 'exportword',
    config: {
      exportword_service_url: "https://exportdocx.converter.tiny.cloud",
      exportword_converter_options: {
        // 'Letter', 'Legal', 'Tabloid', 'Statement', 'Executive', 'A3', 'A4', 'A5', 'A6', 'B4', 'B5'
        format: 'A4',

        margin_top: '1in',
        margin_bottom: '1in',
        margin_right: '1in',
        margin_left: '1in',
        header: [
          {
            html: '<h1>First page header.</h1>', 
            css: 'h1 { font-size: 30px; }',
            
            //'default', 'even', 'odd', 'first'
            type: 'first'
          }
        ],

        footer: [
          {
            html: '<p>Page footer</p>',
            css: 'p { font-size: 12px; }',
            // 'default', 'even', 'odd', 'first'
            type: 'default'
          }
        ],

        // 'portrait' or 'landscape'
        orientation: 'portrait',
        auto_pagination: true,

        base_url: 'https://example.com',
        timezone: 'UTC'
      },
      exportword_converter_style: 'p { color: cyan !important }',
    },
  };

  var InsertDatetimeConfig = {
    name: 'insertdatetime',
    toolbar: 'insertdatetime',
    config: {
      // override the default formatting rule for date formats inserted by the mceInsertDate command
      insertdatetime_dateformat: "%Y/%m/%d",

      // override the default formatting rule for times inserted by the mceInsertTime command
      insertdatetime_timeformat: "%H%M%S",

      // specify a list of date/time formats to be used in the date menu or date select box
      insertdatetime_formats: ["%H:%M:%S", "%Y-%m-%d", "%I:%M:%S %p", "%D", "%H%M%S", "%Y/%m/%d"],
    }
  };

  var AnchorConfig = {
    name: 'anchor',
    toolbar: 'anchor',
    config: {}
  };

  var AutolinkConfig = {
    name: 'autolink',
    config: {}
  };

  var AutosaveConfig = {
    name: 'autosave',
    config: {}
  };

  var CharmapConfig = {
    name: 'charmap',
    toolbar: 'charmap',
    config: {}
  };

  var CodeConfig = {
    name: 'code',
    toolbar: 'code',
    config: {}
  };

  var EditimageConfig = {
    name: 'editimage',
    config: {}
  };

  var DirectionalityConfig = {
    name: 'directionality',
    toolbar: 'ltr rtl',
    config: {}
  };

  var EmoticonsConfig = {
    name: 'emoticons',
    toolbar: 'emoticons',
    config: {}
  };

  var FullscreenConfig = {
    name: 'fullscreen',
    toolbar: 'fullscreen',
    config: {}
  };

  var HelpConfig = {
    name: 'help',
    toolbar: 'help',
    config: {}
  };

  var ImageConfig = {
    name: 'image',
    toolbar: 'image',
    config: {
      image_advtab: true,
      image_description: true,
      image_dimensions: true,
      image_title: true,
      image_caption: true,
    }
  };

  var ImportcssConfig = {
    name: 'importcss',
    config: {}
  };

  var LinkConfig = {
    name: 'link',
    toolbar: 'link unlink',
    config: {}
  };

  var ListsConfig = {
    name: 'lists',
    toolbar: 'numlist bullist',
    config: {}
  };

  var MediaConfig = {
    name: 'media',
    toolbar: 'media',
    config: {}
  };

  var NonbreakingConfig = {
    name: 'nonbreaking',
    toolbar: 'nonbreaking',
    config: {}
  };

  var PagebreakConfig = {
    name: 'pagebreak',
    toolbar: 'pagebreak',
    config: {}
  };

  var PreviewConfig = {
    name: 'preview',
    toolbar: 'preview',
    config: {}
  };

  var QuickbarsConfig = {
    name: 'quickbars',
    config: {
      quickbars_image_toolbar: 'alignleft aligncenter alignright',
      quickbars_selection_toolbar: 'undo redo | copy cut paste | quicklink align',
      quickbars_insert_toolbar: 'quickimage quicktable | hr pagebreak'
    }
  };

  var SaveConfig = {
    name: 'save',
    toolbar: 'save cancel',
    config: {}
  };

  var SearchreplaceConfig = {
    name: 'searchreplace',
    toolbar: 'searchreplace',
    config: {
      save_onsavecallback: function () { alert("Saved"); },
      save_oncancelcallback: function () { alert("Save Cancelled"); },
    }
  };

  var TableConfig = {
    name: 'table',
    toolbar: 'table',
    config: {}
  };

  var VisualblocksConfig = {
    name: 'visualblocks',
    toolbar: 'visualblocks',
    config: {}
  };

  var VisualcharsConfig = {
    name: 'visualchars',
    toolbar: 'visualchars',
    config: {}
  };

  var WordcountConfig = {
    name: 'wordcount',
    config: {}
  };

  var A11ycheckerConfig = {
    name: 'a11ychecker',
    config: {},
    toolbar: 'a11ycheck'
  };

  var AdvcodeConfig = {
    name: 'advcode',
    config: {
      advcode_inline: true
    }
  };

  var AdvtableConfig = {
    name: 'advtable',
    config: {}
  };

  var AutocorrectConfig = {
    name: 'autocorrect',
    config: {
      autocorrect_autocorrect: true,
      autocorrect_capitalize: true,
    }
  };

  var CasechangeConfig = {
    name: 'casechange',
    toolbar: 'casechange',
    config: {}
  };

  var ChecklistConfig = {
    name: 'checklist',
    toolbar: 'checklist',
    config: {}
  };

  var EditimageConfig2 = {
    name: 'editimage',
    toolbar: 'rotateleft rotateright flipv fliph editimage imageoptions',
    config: {
      editimage_toolbar: "rotateleft rotateright flipv fliph editimage imageoptions",
      editimage_proxy_service_url: 'https://imageproxy.tiny.cloud',
    }
  };

  var ExportpdfConfig = {
    name: 'exportpdf',
    toolbar: 'exportpdf',
    config: {
      exportpdf_service_url: "https://exportpdf.converter.tiny.cloud",
      exportpdf_converter_options: {
        header_html: '<div style="text-align:center;">Document Title</div><div>Date: <span class="date"></span></div><div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
        footer_html: '<div style="text-align:right;">Confidential</div>',
        header_and_footer_css: 'div { color: blue; font-family: Arial, sans-serif; font-size: 10pt; }',
        margin_top: '2cm',
        margin_bottom: '2cm',
        margin_left: '20mm',
        margin_right: '20mm',
        format: 'A4',
        page_orientation: 'portrait',
      },
      exportpdf_converter_style: 'body { color: black !important; font-family: Helvetica, Arial, sans-serif; } p { color: cyan !important; }',
    }
  };

  var FootnotesConfig = {
    name: 'footnotes',
    toolbar: 'footnotes footnotesupdate',
    config: {}
  };

  var FormatpainterConfig = {
    name: 'formatpainter',
    toolbar: 'formatpainter',
    config: {}
  };

  var ImportwordConfig = {
    name: 'importword',
    toolbar: 'importword',
    config: {
      importword_service_url: "https://importdocx.converter.tiny.cloud",
      importword_converter_options: {
        formatting: {
          styles: 'inline',
          resets: 'inline',
          defaults: 'inline',
        }
      }
    }
  };

  var InlinecssConfig = {
    name: 'inlinecss',
    config: {}
  };

  var LinkcheckerConfig = {
    name: 'linkchecker',
    config: {}
  };

  var MarkdownConfig = {
    name: 'markdown',
    config: {}
  };

  var MathConfig = {
    name: 'math',
    toolbar: 'math',
    config: {}
  };

  var MediaembedConfig = {
    name: 'mediaembed',
    config: {}
  };

  var PageembedConfig = {
    name: 'pageembed',
    toolbar: 'pageembed',
    config: {}
  };

  var PermanentpenConfig = {
    name: 'permanentpen',
    toolbar: 'permanentpen',
    config: {
      permanentpen_properties: {
        fontname: 'impact,sans-serif',
        forecolor: '#E74C3C',
        fontsize: '12px',
        bold: true,
        italic: false,
        strikethrough: false,
        underline: false
      },
    }
  };

  var PowerpasteConfig = {
    name: 'powerpaste',
    config: {}
  };

  const revisions = [
    {
      'revisionId': '1',
      'createdAt': '2023-11-25T03:30:46.171Z',
      'content': '<h2>Rev 1</h2>'
    },
    {
      'revisionId': '2',
      'createdAt': '2023-11-25T12:06:09.675Z',
      'content': '<h2>Rev 2</h2>'
    },
    {
      'revisionId': '3',
      'createdAt': '2023-11-27T03:23:32.351Z',
      'content': '<h2>Rev 3</h2>'
    },
    {
      'revisionId': '4',
      'createdAt': '2023-11-29T12:35:16.203Z',
      'content': '<h2>Rev 4</h2>'
    },
    {
      'revisionId': '5',
      'createdAt': '2023-11-28T08:01:56.100Z',
      'content': '<h2>Rev 5</h2>'
    }
  ];

  var RevisionhistoryConfig = {
    toolbar: 'revisionhistory',
    name: 'revisionhistory',
    config: {
      revisionhistory_fetch: () => Promise.resolve(revisions),
    }
  };

  var TableofcontentsConfig = {
    name: 'tableofcontents',
    toolbar: 'tableofcontents',
    config: {}
  };

  var TinymcespellcheckerConfig = {
    name: 'tinymcespellchecker',
    config: {}
  };

  var TypographyConfig = {
    name: 'typography',
    toolbar: 'typography',
    config: {}
  };

  var UploadcareConfig = {
    name: 'uploadcare',
    toolbar: 'uploadcare',
    config: {
      uploadcare_public_key: '6ff5776be9bb64e10023',
    }
  };

  const API_URL = 'https://demouserdirectory.tiny.cloud/v1/users';

  const user_id = 'james-wilson';
  const basicConfig = {
    height: 600,
    mobile: {
      theme: "silver",
      contextmenu: "link image table preview",
    },
    pad_empty_with_br: true,
    help_accessibility: true,
    // TODO: Target for tinymce 8
    user_id,
    fetch_users: (userIds) =>
      Promise.all(userIds.map((userId) => fetch(`${API_URL}/${userId}`)
        .then((response) => response.json())
        .catch(() => ({ id: userId })))),
    
  };

  const pluginsConfig = [
    AccordionConfig,
    CodeSampleConfig,
    AdvlistConfig,
    AnchorConfig,
    AutolinkConfig,
    AutosaveConfig,
    CharmapConfig,
    CodeConfig,
    EditimageConfig,
    DirectionalityConfig,
    EmoticonsConfig,
    FullscreenConfig,
    HelpConfig,
    ImageConfig,
    ImportcssConfig,
    InsertDatetimeConfig,
    LinkConfig,
    ListsConfig,
    MediaConfig,
    NonbreakingConfig,
    PagebreakConfig,
    PreviewConfig,
    QuickbarsConfig,
    SaveConfig,
    SearchreplaceConfig,
    TableConfig,
    VisualblocksConfig,
    VisualcharsConfig,
    WordcountConfig,
    A11ycheckerConfig,
    AdvcodeConfig,
    AdvtableConfig,
    AdvtemplateConfig,
    AutocorrectConfig,
    CasechangeConfig,
    ChecklistConfig,
    EditimageConfig2,
    ExportpdfConfig,
    ExportWordConfig,
    FootnotesConfig,
    FormatpainterConfig,
    ImportwordConfig,
    InlinecssConfig,
    LinkcheckerConfig,
    MarkdownConfig,
    MathConfig,
    MediaembedConfig,
    MentionsConfig,
    MergetagsConfig,
    PageembedConfig,
    PermanentpenConfig,
    PowerpasteConfig,
    RevisionhistoryConfig,
    SuggestedEditConfig,
    TableofcontentsConfig,
    TinyCommentsConfig,
    TinymcespellcheckerConfig,
    TypographyConfig,
    UploadcareConfig,
    TinymceaiConfig,
  ];

  const toolbarConfig = pluginsConfig.map((plugin) => plugin?.toolbar).filter(Boolean).join(' | ');
  const generateConfig = ({ excludePlugins = [], overrideConfig = {} }) => {
    const plugins = pluginsConfig.map((p) => p.name).filter((name) => !excludePlugins.includes(name));
    const extractedPluginsConfig = pluginsConfig.reduce((acc, cur) => {
      return { ...acc, ...cur.config };
    }, {});
    const finalConfig = {
      ...basicConfig,
      ...extractedPluginsConfig,
      ...overrideConfig
    };

    return {
      ...finalConfig,
      plugins: plugins,
      toolbar: toolbarConfig,
      height: 500
    };
  };

  exports.generateConfig = generateConfig;

  return exports;

})({});
